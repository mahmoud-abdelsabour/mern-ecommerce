const reviewController = require('../controllers/review.controller')
const { asyncWrapper, validate, auth, ownership, role } = require('../utils/middleware/index')
const reviewValidator = require('../validators/review.validator')
const Review = require('../models/review.model')
const express = require('express')
//api/reviews
const router = express.Router()

router.patch(
    '/:reviewId',
    auth,
    role('user'),
    ownership(Review, 'reviewId', 'user'),
    validate(reviewValidator.updateReviewSchema),
    asyncWrapper(reviewController.updateReview)
)

router.delete(
    '/:reviewId',
    auth,
    ownership(Review, 'reviewId', 'user', true),
    asyncWrapper(reviewController.deleteReview)
)

module.exports = router