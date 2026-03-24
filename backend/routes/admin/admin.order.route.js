const express = require('express')
const orderController = require('../../controllers/order.controller')
const orderValidator = require('../../validators/order.validator')
const { asyncWrapper, validate, auth, role } = require('../../utils/middleware')

const router = express.Router()

router.get(
    '/',
    auth,
    role('admin'),
    asyncWrapper(orderController.getAllOrders)
)

router.patch(
    '/:orderId/deliveryStatus',
    auth,
    role('admin'),
    asyncWrapper(orderController.updateOrderDeliveryStatus)
)

module.exports = router
