const productController = require('../controllers/product.controller')
const reviewController = require('../controllers/review.controller')
const { asyncWrapper, auth, validate, role } = require('../utils/middleware/index')
const reviewValidator = require('../validators/review.validator')
const express = require('express')
//api/products
const router = express.Router()

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products (with filters and pagination)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: brand
 *         schema: { type: string }
 *         description: Brand slug
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Category slug
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: minRating
 *         schema: { type: number }
 *       - in: query
 *         name: includeDeleted
 *         schema: { type: boolean }
 *         description: Admin only
 *       - in: query
 *         name: onlyDeleted
 *         schema: { type: boolean }
 *         description: Admin only
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: number }
 *       - in: query
 *         name: limit
 *         schema: { type: number }
 *       - in: query
 *         name: sort
 *         schema: { type: object }
 *         description: JSON string or object (e.g. {"createdAt":-1})
 *     responses:
 *       200:
 *         description: Products list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductsListResponse'
 */
router.get('/', asyncWrapper(productController.getProducts))

/**
 * @swagger
 * /api/products/{productId}:
 *   get:
 *     summary: Get product details by id
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product detail with reviews preview
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductDetailResponse'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:productId', asyncWrapper(productController.getProductById))

/**
 * @swagger
 * /api/products/{productId}/reviews:
 *   get:
 *     summary: Get product reviews (paginated)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: number }
 *       - in: query
 *         name: limit
 *         schema: { type: number }
 *       - in: query
 *         name: sort
 *         schema: { type: object }
 *         description: JSON string or object (e.g. {"createdAt":-1})
 *     responses:
 *       200:
 *         description: Reviews list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewsListResponse'
 */
router.get(
    '/:productId/reviews',
    asyncWrapper(reviewController.getAllReviews)
)

/**
 * @swagger
 * /api/products/{productId}/reviews:
 *   post:
 *     summary: Create a review for a product (buyer only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating: { type: number, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       201:
 *         description: Review created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       403:
 *         description: Only buyers can review
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Product already reviewed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/:productId/reviews',
    auth,
    role('user'),
    validate(reviewValidator.createReviewSchema),
    asyncWrapper(reviewController.createReview)
)

/**
 * @swagger
 * /api/products/{productId}/user-status:
 *   get:
 *     summary: Get user status for a product (in cart/wishlist)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User product status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductUserStatus'
 */
router.get(
    '/:productId/user-status',
    auth,
    asyncWrapper(productController.getProductUserStatus)
)

module.exports = router
