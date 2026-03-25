const express = require('express')
const orderController = require('../../controllers/order.controller')
const { asyncWrapper, auth, role, validate } = require('../../utils/middleware/index')
const orderValidator = require('../../validators/order.validator')

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
    validate(orderValidator.updateOrderDeliveryStatusSchema),
    asyncWrapper(orderController.updateOrderDeliveryStatus)
)

module.exports = router
