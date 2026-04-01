const express = require('express')
const orderController = require('../../controllers/order.controller')
const { asyncWrapper, auth, role, validate } = require('../../utils/middleware/index')
const orderValidator = require('../../validators/order.validator')
//api/admin/orders
const router = express.Router()

// get all orders
/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders (admin)
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: number }
 *       - in: query
 *         name: limit
 *         schema: { type: number }
 *       - in: query
 *         name: deliveryStatus
 *         schema: { type: string }
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *       - in: query
 *         name: minTotal
 *         schema: { type: number }
 *       - in: query
 *         name: maxTotal
 *         schema: { type: number }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: sort
 *         schema: { type: object }
 *     responses:
 *       200:
 *         description: Orders list (card view)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminOrdersListResponse'
 */
router.get(
    '/',
    auth,
    role('admin'),
    asyncWrapper(orderController.getAllOrders)
)

// change the delivery status
/**
 * @swagger
 * /api/admin/orders/{orderId}/deliveryStatus:
 *   patch:
 *     summary: Update order delivery status
 *     tags: [Admin Orders]
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
 *             required: [deliveryStatus]
 *             properties:
 *               deliveryStatus:
 *                 type: string
 *                 enum: [shipped, delivered, returned, refunded]
 *     responses:
 *       200:
 *         description: Updated order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Invalid status transition
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
    '/:orderId/deliveryStatus',
    auth,
    role('admin'),
    validate(orderValidator.updateOrderDeliveryStatusSchema),
    asyncWrapper(orderController.updateOrderDeliveryStatus)
)

//get user's orders
/**
 * @swagger
 * /api/admin/orders/users/{userId}:
 *   get:
 *     summary: Get orders for a user (admin)
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
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
router.get(
    '/users/:userId',
    auth,
    role('admin'),
    asyncWrapper(orderController.getUserOrdersForAdmin)
)

module.exports = router
