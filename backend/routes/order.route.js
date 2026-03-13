const orderController = require('../controllers/order.controller')
const { asyncWrapper, auth, validate, ownership } = require('../utils/middleware/index')
const orderValidator = require('../validators/order.validator')
const Order = require('../models/order.model')
const express = require('express')
const router = express.Router()

router.post(
    '/',
    auth,
    validate(orderValidator.createOrderSchema),
    asyncWrapper(orderController.createOrder)
)

router.get(
    '/',
    auth,
    asyncWrapper(orderController.getOrders)
)

router.get(
    '/:orderId',
    auth,
    ownership(Order, 'orderId'),
    asyncWrapper(orderController.getOrderById)
)

router.patch(
    '/:orderId/cancel',
    auth,
    ownership(Order, 'orderId'),
    asyncWrapper(orderController.cancelOrder)
)

router.post(
    '/:orderId/return',
    auth,
    ownership(Order, 'orderId'),
    validate(orderValidator.returnRequestSchema),
    asyncWrapper(orderController.returnRequest)
)

module.exports = router