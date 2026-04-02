const mongoose = require('mongoose')
const { faker } = require('@faker-js/faker')
const config = require('./config/config')
const User = require('../models/user.model')
const Product = require('../models/product.model')
const Brand = require('../models/brand.model')
const Category = require('../models/category.model')
const Order = require('../models/order.model')
const Review = require('../models/review.model')
const { hashingValue } = require('./auth/password.util')
const slugify = require('slugify')

const randomInt = (min, max) => faker.number.int({ min, max })
const pickOne = (arr) => arr[randomInt(0, arr.length - 1)]
const sampleMany = (arr, count) => {
    const copy = [...arr]
    const result = []
    while (result.length < count && copy.length > 0) {
        const idx = randomInt(0, copy.length - 1)
        result.push(copy.splice(idx, 1)[0])
    }
    return result
}

const connectDb = async () => {
    if (!config.MONGODB_URI) {
        throw new Error('MONGODB_URI is missing')
    }
    await mongoose.connect(config.MONGODB_URI, { family: 4 })
}

const dropDatabase = async () => {
    await mongoose.connection.db.dropDatabase()
}

const seed = async () => {
    await connectDb()
    await dropDatabase()

    const brandCount = 12
    const categoryCount = 10
    const userCount = 80
    const productCount = 180
    const orderCount = 220

    // Brands
    const brandDocs = Array.from({ length: brandCount }, () => {
        const name = faker.company.name()
        return {
            name,
            slug: slugify(name, { lower: true, strict: true }),
            logo: `https://picsum.photos/seed/brand-${faker.string.alphanumeric(8)}/200/200`,
            isDeleted: faker.datatype.boolean({ probability: 0.1 })
        }
    })
    const brands = await Brand.insertMany(brandDocs)

    // Categories
    const categoryDocs = Array.from({ length: categoryCount }, () => {
        const baseName = faker.commerce.department()
        const name = `${baseName} ${faker.string.alphanumeric(4)}`
        return {
            name,
            slug: slugify(`${name}-${faker.string.alphanumeric(4)}`, { lower: true, strict: true })
        }
    })
    const categories = await Category.insertMany(categoryDocs)

    // Users
    const defaultPassword = 'Aa1@aaaa'
    const passwordHash = await hashingValue(defaultPassword, 10)
    const userDocs = Array.from({ length: userCount }, (_, idx) => {
        const firstName = faker.person.firstName()
        const lastName = faker.person.lastName()
        const baseUsername = faker.internet.username({ firstName, lastName })
        const username = `${baseUsername}${faker.string.alphanumeric(4)}`.slice(0, 30)
        const email = faker.internet.email({ firstName, lastName }).toLowerCase()
        const phonePrefix = faker.helpers.arrayElement(['010', '011', '012', '015'])
        const phone = `${phonePrefix}${faker.string.numeric(8)}`
        const isAdmin = idx < 5
        const isDeleted = faker.datatype.boolean({ probability: 0.05 })
        const address = {
            address_name: faker.helpers.arrayElement(['Home', 'Work', 'Office']),
            country: 'Egypt',
            city: faker.location.city(),
            postalcode: faker.location.zipCode(),
            street: faker.location.street(),
            building: faker.location.buildingNumber(),
            floor: randomInt(1, 12),
            special_mark: faker.datatype.boolean({ probability: 0.4 }) ? faker.lorem.words(3) : ''
        }

        return {
            firstName,
            lastName,
            username,
            email,
            phone,
            passwordHash,
            role: isAdmin ? 'admin' : 'user',
            isDeleted,
            deletedAt: isDeleted ? faker.date.recent({ days: 30 }) : null,
            addresses: [address],
            cart: [],
            wishlist: []
        }
    })
    const users = await User.insertMany(userDocs)

    const activeBrands = brands.filter(b => !b.isDeleted)
    const activeCategories = categories.filter(c => !c.isDeleted)

    // Products
    const productDocs = Array.from({ length: productCount }, () => {
        const brand = pickOne(activeBrands)
        const category = pickOne(activeCategories)
        const photosCount = randomInt(2, 4)
        const photos = Array.from({ length: photosCount }, () =>
            `https://picsum.photos/seed/product-${faker.string.alphanumeric(10)}/800/800`
        )
        return {
            name: faker.commerce.productName(),
            price: Number(faker.commerce.price({ min: 10, max: 1500 })),
            photos,
            description: faker.commerce.productDescription(),
            category: category._id,
            brand: brand._id,
            stock: randomInt(0, 100),
            rating: {
                score: faker.number.float({ min: 0, max: 5, precision: 0.1 }),
                voters: randomInt(0, 200)
            },
            isDeleted: faker.datatype.boolean({ probability: 0.08 })
        }
    })
    const products = await Product.insertMany(productDocs)

    // Update users with wishlist/cart
    await Promise.all(
        users.map(async (user) => {
            const wishlistItems = sampleMany(products, randomInt(0, 6)).map(p => p._id)
            const cartItems = sampleMany(products, randomInt(0, 4)).map(p => ({
                product: p._id,
                quantity: randomInt(1, 3)
            }))
            user.wishlist = wishlistItems
            user.cart = cartItems
            await user.save()
        })
    )

    // Orders
    const deliveryStatuses = [
        'pending',
        'shipped',
        'delivered',
        'cancelled',
        'return requested',
        'returned',
        'refunded'
    ]

    const orderDocs = Array.from({ length: orderCount }, () => {
        const user = pickOne(users)
        const items = sampleMany(products, randomInt(1, 3))

        const orderProducts = items.map(item => ({
            product: item._id,
            quantity: randomInt(1, 3),
            priceAtPurchase: item.price,
            name: item.name,
            description: item.description,
            photos: item.photos,
            brand: String(item.brand),
            category: String(item.category)
        }))

        const totalPrice = orderProducts.reduce((sum, p) => sum + (p.priceAtPurchase * p.quantity), 0)
        const deliveryStatus = pickOne(deliveryStatuses)

        const createdAt = faker.date.recent({ days: 90 })
        const shippedAt = ['shipped', 'delivered','return requested', 'returned', 'refunded'].includes(deliveryStatus)
            ? faker.date.between({ from: createdAt, to: new Date() })
            : null
        const deliveredAt = ['delivered', 'return requested', 'returned', 'refunded'].includes(deliveryStatus)
            ? faker.date.between({ from: shippedAt || createdAt, to: new Date() })
            : null

        const returnInfo = ['return requested', 'returned', 'refunded'].includes(deliveryStatus)
            ? {
                returnedItems: orderProducts.slice(0, 1).map(p => ({
                    product: p.product,
                    quantity: 1,
                    reason: faker.lorem.sentence()
                })),
                returnDate: deliveryStatus === 'return requested' ? null : faker.date.recent({ days: 30 })
            }
            : { returnedItems: [], returnDate: null }

        const address = pickOne(user.addresses)
        return {
            products: orderProducts,
            userId: user._id,
            shippingInfo: {
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                phone: user.phone,
                address: {
                    country: address.country,
                    city: address.city,
                    postalcode: address.postalcode,
                    street: address.street,
                    building: address.building,
                    floor: address.floor,
                    special_mark: address.special_mark
                }
            },
            totalPrice,
            returnInfo,
            deliveryStatus,
            shippedAt,
            deliveredAt,
            createdAt
        }
    })

    const orders = await Order.insertMany(orderDocs)

    // Reviews (unique per user+product, only for delivered-ish orders)
    const reviewMap = new Set()
    const reviewDocs = []
    orders
        .filter(o => ['delivered', 'return requested', 'returned', 'refunded'].includes(o.deliveryStatus))
        .forEach(order => {
            if (faker.datatype.boolean({ probability: 0.5 })) return
            const user = users.find(u => String(u._id) === String(order.userId))
            if (!user) return

            order.products.forEach(p => {
                if (faker.datatype.boolean({ probability: 0.6 })) return
                const key = `${user._id}_${p.product}`
                if (reviewMap.has(key)) return
                reviewMap.add(key)
                reviewDocs.push({
                    user: user._id,
                    product: p.product,
                    rating: randomInt(1, 5),
                    comment: faker.lorem.sentence(),
                    name: user.firstName
                })
            })
        })

    if (reviewDocs.length > 0) {
        await Review.insertMany(reviewDocs)
    }

    // Recalculate rating by sampling reviews for products
    const productReviewStats = new Map()
    reviewDocs.forEach(r => {
        const key = String(r.product)
        const stat = productReviewStats.get(key) || { total: 0, count: 0 }
        stat.total += r.rating
        stat.count += 1
        productReviewStats.set(key, stat)
    })

    await Promise.all(
        Array.from(productReviewStats.entries()).map(([productId, stat]) =>
            Product.findByIdAndUpdate(
                productId,
                { rating: { score: stat.total / stat.count, voters: stat.count } }
            )
        )
    )

    console.log('Seed complete')
    console.log(`Brands: ${brands.length}`)
    console.log(`Categories: ${categories.length}`)
    console.log(`Users: ${users.length}`)
    console.log(`Products: ${products.length}`)
    console.log(`Orders: ${orders.length}`)
    console.log(`Reviews: ${reviewDocs.length}`)
}

seed()
    .catch(err => {
        console.error(err)
        process.exitCode = 1
    })
    .finally(async () => {
        await mongoose.connection.close()
    })
