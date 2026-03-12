const productController = require('../controllers/product.controller')
const { asyncWrapper } = require('../utils/middleware/index')
const express = require('express')

const router = express.Router()

router.get('/', asyncWrapper(productController.getProducts))

router.get('/:productId', asyncWrapper(productController.getProductById))

module.exports = router