const productController = require('../controllers/product.controller')
const reviewController = require('../controllers/review.controller')
const { asyncWrapper, auth, validate, role } = require('../utils/middleware/index')
const reviewValidator = require('../validators/review.validator')
const express = require('express')
//api/products
const router = express.Router()

router.get('/', asyncWrapper(productController.getProducts))

router.get('/:productId', asyncWrapper(productController.getProductById))

router.get(
    '/:productId/reviews',
    asyncWrapper(reviewController.getAllReviews)
)

router.post(
    '/:productId/reviews',
    auth,
    role('user'),
    validate(reviewValidator.createReviewSchema),
    asyncWrapper(reviewController.createReview)
)

router.get(
    '/:productId/user-status',
    auth,
    asyncWrapper(productController.getProductUserStatus)
)

module.exports = router