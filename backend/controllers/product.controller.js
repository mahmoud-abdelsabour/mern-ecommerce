const productService = require('../services/product.service')

const getProducts = async (request, response) => {
    const products = await productService.getProducts({ ...request.query })
    return response.status(200).json(products)
}

const getProductById = async (request, response) => {
    const result = await productService.getProductById({ ...request.params })
    return response.status(200).json(result)
}

const getProductUserStatus = async (req, res) => {
    const { productId } = req.params
    const user = req.user

    const status = await productService.getProductUserStatus({ productId, user })

    return res.status(200).json(status)
}

module.exports = {
    getProducts,
    getProductById,
    getProductUserStatus
}