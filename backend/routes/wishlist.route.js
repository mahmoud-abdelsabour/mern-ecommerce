const express = require('express')
const wishlistController = require('../controllers/wishlist.controller')
const { asyncWrapper, auth, role } = require('../utils/middleware/index')
// api/wishlist
const router = express.Router()

// get wishlist
/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Get user wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist product ids
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { type: string }
 */
router.get('/', auth, role('user'), asyncWrapper(wishlistController.getWishlist))

// add to wishlist
/**
 * @swagger
 * /api/wishlist/products/{productId}:
 *   post:
 *     summary: Add product to wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { type: string }
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Product already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/products/:productId',
    auth,
    role('user'),
    asyncWrapper(wishlistController.addToWishlist)
)

// delete from wishlist
/**
 * @swagger
 * /api/wishlist/products/{productId}:
 *   delete:
 *     summary: Remove product from wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { type: string }
 *       404:
 *         description: Product not in wishlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
    '/products/:productId',
    auth,
    role('user'),
    asyncWrapper(wishlistController.removeFromWishlist)
)

// clear wishlist
/**
 * @swagger
 * /api/wishlist:
 *   delete:
 *     summary: Clear wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Empty wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { type: string }
 */
router.delete('/', auth, role('user'), asyncWrapper(wishlistController.clearWishlist))

module.exports = router
