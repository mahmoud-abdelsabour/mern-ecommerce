const express = require('express')
const orderController = require('../controllers/order.controller')
const { asyncWrapper, auth, validate, ownership, role } = require('../utils/middleware/index')
const orderValidator = require('../validators/order.validator')
const Order = require('../models/order.model')

const router = express.Router()
// api/orders

// create order
/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [products, shippingInfo]
 *             properties:
 *               products:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [product, quantity]
 *                   properties:
 *                     product: { type: string }
 *                     quantity: { type: number, minimum: 1 }
 *               shippingInfo:
 *                 $ref: '#/components/schemas/ShippingInfo'
 *     responses:
 *       201:
 *         description: Order created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       409:
 *         description: Not enough stock
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/',
    auth,
    role('user'),
    validate(orderValidator.createOrderSchema),
    asyncWrapper(orderController.createOrder)
)

// get user orders
/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get orders for authenticated user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: number }
 *       - in: query
 *         name: limit
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: Orders list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdersListResponse'
 */
router.get('/', auth, role('user'), asyncWrapper(orderController.getOrders))

// get order by id
/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Get order by id (owner or admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
    '/:orderId',
    auth,
    ownership(Order, 'orderId', 'userId', true),
    asyncWrapper(orderController.getOrderById)
)

// cancel order
/**
 * @swagger
 * /api/orders/{orderId}/cancel:
 *   patch:
 *     summary: Cancel a pending order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order cancelled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 order: { $ref: '#/components/schemas/Order' }
 *       409:
 *         description: Order is not pending or not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
    '/:orderId/cancel',
    auth,
    role('user'),
    ownership(Order, 'orderId'),
    asyncWrapper(orderController.cancelOrder)
)

// return items
/**
 * @swagger
 * /api/orders/{orderId}/return:
 *   post:
 *     summary: Request a return for delivered order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [returnedItems]
 *             properties:
 *               returnedItems:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   $ref: '#/components/schemas/ReturnItem'
 *               reason:
 *                 type: string
 *                 maxLength: 300
 *                 description: Optional single reason applied to the full return request
 *     responses:
 *       201:
 *         description: Return request submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 order: { $ref: '#/components/schemas/Order' }
 *       400:
 *         description: Invalid return request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/:orderId/return',
    auth,
    role('user'),
    ownership(Order, 'orderId'),
    validate(orderValidator.returnRequestSchema),
    asyncWrapper(orderController.returnRequest)
)

module.exports = router
