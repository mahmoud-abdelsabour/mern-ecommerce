const { api, mongoose, waitForDb } = require('../generalHelper')
const Product = require('../../models/product.model')
const Brand = require('../../models/brand.model')
const Category = require('../../models/category.model')

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

module.exports = {
    api,
    mongoose,
    waitForDb,
    clearProducts,
    createBrand,
    createCategory,
    createProduct
}
