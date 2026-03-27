const { api, mongoose, waitForDb, createUser } = require('../generalHelper')
const Product = require('../../models/product.model')
const Brand = require('../../models/brand.model')
const Category = require('../../models/category.model')
const Review = require('../../models/review.model')
const Order = require('../../models/order.model')

const clearProducts = async () => {
    await Product.deleteMany({})
    await Brand.deleteMany({})
    await Category.deleteMany({})
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
                special_mark: ''
            }
        },
        totalPrice: product.price,
        deliveryStatus: 'delivered'
    }).save()
}

module.exports = {
    api,
    mongoose,
    waitForDb,
    clearProducts,
    createBrand,
    createCategory,
    createProduct,
    createReviewsForProduct,
    createDeliveredOrder
}
