const reviewController = require('../controllers/review.controller')
const { asyncWrapper, validate, auth, ownership, role } = require('../utils/middleware/index')
const reviewValidator = require('../validators/review.validator')
const Review = require('../models/review.model')
const express = require('express')
//api/reviews
const router = express.Router()

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   patch:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               rating: { type: number, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       200:
 *         description: Review updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       403:
 *         description: Forbidden (not owner)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
    '/:reviewId',
    auth,
    role('user'),
    ownership(Review, 'reviewId', 'user'),
    validate(reviewValidator.updateReviewSchema),
    asyncWrapper(reviewController.updateReview)
)

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   delete:
 *     summary: Delete a review (owner or admin)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Review deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
    '/:reviewId',
    auth,
    ownership(Review, 'reviewId', 'user', true),
    asyncWrapper(reviewController.deleteReview)
)

module.exports = router
