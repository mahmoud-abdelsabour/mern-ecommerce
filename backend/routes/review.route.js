const reviewController = require('../controllers/review.controller')
const { asyncWrapper, validate, auth, ownership } = require('../utils/middleware/index')
const reviewValidator = require('../validators/review.validator')
const Review = require('../models/review.model')
const express = require('express')

const router = express.Router()

router.post(
    '/:productId/reviews',
    auth,
    validate(reviewValidator.createReviewSchema),
    asyncWrapper(reviewController.createReview)
)

router.patch(
    '/:reviewId',
    auth,
    ownership(Review, 'reviewId', 'user'),
    validate(reviewValidator.updateReviewSchema),
    asyncWrapper(reviewController.updateReview)
)

router.delete(
    '/:reviewId',
    auth,
    ownership(Review, 'reviewId', 'user'),
    asyncWrapper(reviewController.deleteReview)
)

module.exports = router