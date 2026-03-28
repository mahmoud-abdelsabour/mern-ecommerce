const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../app')
const User = require('../models/user.model')
const Product = require('../models/product.model')
const Brand = require('../models/brand.model')
const Category = require('../models/category.model')
const Review = require('../models/review.model')
const Order = require('../models/order.model')
const { hashingValue } = require('../utils/auth/password.util')
const { createToken } = require('../utils/auth/token.util')

const api = request(app)

const waitForDb = (timeoutMs = 20000) => {
    if (mongoose.connection.readyState === 1) return Promise.resolve()
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('MongoDB connection timeout')), timeoutMs)
        mongoose.connection.once('open', () => {
            clearTimeout(timer)
            resolve()
        })
        mongoose.connection.once('error', (err) => {
            clearTimeout(timer)
            reject(err)
        })
    })
}

const buildUserPayload = (overrides = {}) => {
    const unique = `${Date.now()}_${Math.floor(Math.random() * 1e9)}`
    return {
        firstName: 'Test',
        lastName: 'User',
        username: `user_${unique}`,
        email: `user_${unique}@example.com`,
        password: 'Aa1@aaaa',
        phone: `010${Math.floor(10000000 + Math.random() * 90000000)}`,
        ...overrides
    }
}

const createUser = async (overrides = {}) => {
    const payload = buildUserPayload(overrides)
    const passwordHash = await hashingValue(payload.password, 10)

    const user = await new User({
        firstName: payload.firstName,
        lastName: payload.lastName,
        username: payload.username,
        email: payload.email,
        phone: payload.phone,
        passwordHash,
        role: payload.role
    }).save()

    return { user, payload }
}

const clearUsers = async () => {
    await User.deleteMany({})
}

const createBrand = async (overrides = {}) => {
    const brand = await new Brand({
        name: overrides.name || `Brand ${Date.now()}`,
        slug: overrides.slug || `brand-${Date.now()}`,
        logo: overrides.logo
    }).save()
    return brand
}

const createCategory = async (overrides = {}) => {
    const category = await new Category({
        name: overrides.name || `Category ${Date.now()}`,
        slug: overrides.slug || `category-${Date.now()}`
    }).save()
    return category
}

const createProduct = async (overrides = {}) => {
    const brand = overrides.brand || await createBrand()
    const category = overrides.category || await createCategory()

    const product = await new Product({
        name: overrides.name || `Product ${Date.now()}`,
        price: overrides.price ?? 100,
        photos: overrides.photos || ['https://example.com/p.jpg'],
        description: overrides.description || 'Test description for product',
        category: category._id,
        brand: brand._id,
        stock: overrides.stock ?? 5,
        rating: overrides.rating || { score: 0, voters: 0 },
        isDeleted: overrides.isDeleted ?? false
    }).save()

    return { product, brand, category }
}

const clearProducts = async () => {
    await Product.deleteMany({})
    await Brand.deleteMany({})
    await Category.deleteMany({})
    await Review.deleteMany({})
    await Order.deleteMany({})
}

const clearCartData = async () => {
    await Product.deleteMany({})
    await Brand.deleteMany({})
    await Category.deleteMany({})
    await User.deleteMany({})
}

const createReview = async ({ user, product, rating = 4, comment = 'Nice' }) => {
    return Review.create({
        user: user._id,
        product: product._id,
        rating,
        comment,
        name: user.firstName
    })
}

const createReviewsForProduct = async (productId, count) => {
    const users = await Promise.all(
        Array.from({ length: count }, () => createUser())
    )

    return Review.create(
        users.map((u, idx) => ({
            user: u.user._id,
            product: productId,
            rating: 5,
            comment: `Review ${idx}`,
            name: `User ${idx}`
        }))
    )
}

const createDeliveredOrder = async ({ user, product }) => {
    return new Order({
        products: [
            {
                product: product._id,
                quantity: 1,
                priceAtPurchase: product.price,
                name: product.name,
                description: product.description,
                photos: product.photos,
                brand: 'Brand',
                category: 'Category'
            }
        ],
        userId: user._id,
        shippingInfo: {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            phone: user.phone,
            address: {
                country: 'Egypt',
                city: 'Cairo',
                postalcode: '12345',
                street: 'Street 1',
                building: '1',
                floor: 1,
                special_mark: 'nearby'
            }
        },
        totalPrice: product.price,
        deliveryStatus: 'delivered'
    }).save()
}

const buildShippingInfo = (user) => ({
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    phone: user.phone,
    address: {
        country: 'Egypt',
        city: 'Cairo',
        postalcode: '12345',
        street: 'Street 1',
        building: '1',
        floor: 1,
        special_mark: 'nearby'
    }
})

const seedOrder = async ({ user, product, status = 'pending' }) => {
    return new Order({
        products: [
            {
                product: product._id,
                quantity: 1,
                priceAtPurchase: product.price,
                name: product.name,
                description: product.description,
                photos: product.photos,
                brand: 'Brand',
                category: 'Category'
            }
        ],
        userId: user._id,
        shippingInfo: buildShippingInfo(user),
        totalPrice: product.price,
        deliveryStatus: status
    }).save()
}

const setDeliveredAt = async (order, daysAgo = 1) => {
    order.deliveredAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    await order.save()
}

const getAuthToken = (user) => {
    return createToken(user)
}

const logIfServerError = (response) => {
    if (response.status >= 500) {
        // eslint-disable-next-line no-console
        console.log('Server error response:', response.body)
        if (response.body && response.body.stack) {
            // eslint-disable-next-line no-console
            console.log('Server error stack:', response.body.stack)
        }
    }
}

module.exports = {
    api,
    mongoose,
    waitForDb,
    buildUserPayload,
    createUser,
    clearUsers,
    createBrand,
    createCategory,
    createProduct,
    clearProducts,
    clearCartData,
    createReview,
    createReviewsForProduct,
    createDeliveredOrder,
    buildShippingInfo,
    seedOrder,
    setDeliveredAt,
    getAuthToken,
    logIfServerError
}
