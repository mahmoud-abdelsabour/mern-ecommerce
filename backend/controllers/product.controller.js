const productService = require('../services/product.service')

const getProducts = async (request, response) => {
    const products = await productService.getProducts({ ...request.query, ...request.user })
    return response.status(200).json(products)
}

const getProductById = async (request, response) => {
    const result = await productService.getProductById({ ...request.params, ...request.user })
    return response.status(200).json(result)
}

const getProductUserStatus = async (req, res) => {
    const { productId } = req.params
    const user = req.user

    const status = await productService.getProductUserStatus({ productId, user })

    return res.status(200).json(status)
}

// Admin

const createProduct = async (request, response) => {
    const productData = request.body
    const product = await productService.createProduct(productData)
    return response.status(201).json(product)
}

const updateProduct = async (request, response) => {
    const { productId } = request.params
    const updateData = request.body
    const product = await productService.updateProduct({ productId, updateData })
    return response.status(200).json(product)
}

const deleteProduct = async (request, response) => {
    const { productId } = request.params
    const product = await productService.deleteProduct({ productId })
    return response.status(200).json(product)
}

const restoreProduct = async (request, response) => {
    const { productId } = request.params
    const product = await productService.restoreProduct({ productId })
    return response.status(200).json(product)
}


module.exports = {
    getProducts,
    getProductById,
    getProductUserStatus,
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct
}