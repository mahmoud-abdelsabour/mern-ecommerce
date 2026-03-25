const express = require('express')
const orderController = require('../../controllers/order.controller')
const { asyncWrapper, auth, role, validate } = require('../../utils/middleware/index')
const orderValidator = require('../../validators/order.validator')

const router = express.Router()

// get all orders
router.get(
    '/',
    auth,
    role('admin'),
    asyncWrapper(orderController.getAllOrders)
)

// change the delivery status
router.patch(
    '/:orderId/deliveryStatus',
    auth,
    role('admin'),
    validate(orderValidator.updateOrderDeliveryStatusSchema),
    asyncWrapper(orderController.updateOrderDeliveryStatus)
)

//get user's orders
router.get(
    '/user/:userId',
    auth,
    role('admin'),
    asyncWrapper(orderController.getUserOrdersForAdmin)
)

module.exports = router
