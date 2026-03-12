const productService = require('../services/product.service')

const getProducts = async (request, response) => {
    const products = await productService.getProducts({ ...request.query })
    return response.status(200).json(products)
}

const getProductById = async (request, response) => {
    const product = await productService.getProductById({ ...request.params })
    return response.status(200).json(product)
}

module.exports = {
    getProducts,
    getProductById
}