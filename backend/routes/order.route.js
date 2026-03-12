const orderController = require('../controllers/order.controller')
const { asyncWrapper, auth, validate, orderOwnership } = require('../utils/middleware/index')
const orderValidator = require('../validators/order.validator')
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
    orderOwnership,
    asyncWrapper(orderController.getOrderById)
)

router.patch(
    '/:orderId/cancel',
    auth,
    orderOwnership,
    asyncWrapper(orderController.cancelOrder)
)

router.post(
    '/:orderId/return',
    auth,
    orderOwnership,
    validate(orderValidator.returnRequestSchema),
    asyncWrapper(orderController.returnRequest)
)

module.exports = router