const orderController = require('../controllers/order.controller')
const { asyncWrapper, auth, validate, ownership, role } = require('../utils/middleware/index')
const orderValidator = require('../validators/order.validator')
const Order = require('../models/order.model')
const express = require('express')
const router = express.Router()
//api/orders

// create order
router.post(
    '/',
    auth,
    role('user'),
    validate(orderValidator.createOrderSchema),
    asyncWrapper(orderController.createOrder)
)

// get user orders
router.get(
    '/',
    auth,
    role('user'),
    asyncWrapper(orderController.getOrders)
)

// get order by id
router.get(
    '/:orderId',
    auth,
    ownership(Order, 'orderId', true),
    asyncWrapper(orderController.getOrderById)
)

// cancel order
router.patch(
    '/:orderId/cancel',
    auth,
    role('user'),
    ownership(Order, 'orderId'),
    asyncWrapper(orderController.cancelOrder)
)

// return items
router.post(
    '/:orderId/return',
    auth,
    role('user'),
    ownership(Order, 'orderId'),
    validate(orderValidator.returnRequestSchema),
    asyncWrapper(orderController.returnRequest)
)

module.exports = router