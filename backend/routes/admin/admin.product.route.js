const express = require('express')
const productController = require('../../controllers/product.controller')
const productValidator = require('../../validators/product.validator')
const { asyncWrapper, validate, auth, role } = require('../../utils/middleware')
//api/admin/products
const router = express.Router()

router.post(
    '/',
    auth,
    role('admin'),
    validate(productValidator.createProductSchema),
    asyncWrapper(productController.createProduct)
)

router.get(
    '/',
    auth,
    role('admin'),
    asyncWrapper(productController.getProducts)
)

router.get(
    '/:productId',
    auth,
    role('admin'),
    asyncWrapper(productController.getProductById)
)

router.patch(
    '/:productId',
    auth,
    role('admin'),
    validate(productValidator.updateProductSchema),
    asyncWrapper(productController.updateProduct)
)

router.delete(
    '/:productId',
    auth,
    role('admin'),
    asyncWrapper(productController.deleteProduct)
)

router.patch(
    '/:productId/restore',
    auth,
    role('admin'),
    asyncWrapper(productController.restoreProduct)
)

module.exports = router
