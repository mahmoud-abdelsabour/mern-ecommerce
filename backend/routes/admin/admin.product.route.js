const express = require('express')
const productController = require('../../controllers/product.controller')
const productValidator = require('../../validators/product.validator')
const { asyncWrapper, validate, auth, role } = require('../../utils/middleware')
//api/admin/products
const router = express.Router()

//create product
router.post(
    '/',
    auth,
    role('admin'),
    validate(productValidator.createProductSchema),
    asyncWrapper(productController.createProduct)
)

//get all products
router.get(
    '/',
    auth,
    role('admin'),
    asyncWrapper(productController.getProducts)
)

//get product by id
router.get(
    '/:productId',
    auth,
    role('admin'),
    asyncWrapper(productController.getProductById)
)

//update product
router.patch(
    '/:productId',
    auth,
    role('admin'),
    validate(productValidator.updateProductSchema),
    asyncWrapper(productController.updateProduct)
)

//delete product
router.delete(
    '/:productId',
    auth,
    role('admin'),
    asyncWrapper(productController.deleteProduct)
)

//restore product
router.patch(
    '/:productId/restore',
    auth,
    role('admin'),
    asyncWrapper(productController.restoreProduct)
)

module.exports = router
