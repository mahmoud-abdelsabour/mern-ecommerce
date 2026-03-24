const Product = require('../../models/product.model')
const Brand = require('../../models/brand.model')
const Category = require('../../models/category.model')

const createProduct = async (data) => {
    try {
        const {
            name,
            price,
            photos,
            description,
            category,
            stock,
            brand,
            isActive
        } = data

        const DbBrand = await Brand.findById(brand)
        const DbCategory = await Brand.findById(brand)

        if(!DbBrand || DbCategory){
            throw Object.assign(new Error('Bad Request'), { statusCode: 400 })
        }

        const product = new Product({
            name,
            price,
            photos,
            description,
            category,
            stock,
            brand,
            isActive
        })

        const savedProduct = await product.save()
        return savedProduct
    } catch (error) {
        throw error
    }
}

module.exports = {
    createProduct
}
