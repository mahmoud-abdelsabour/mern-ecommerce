const orderService = require('../services/order.service')

const createOrder = async (request, response) => {
    const { user } = request
    const newOrder = await orderService.placeOrder({ ...request.body, user })
    return response.status(201).json(newOrder)
}

const getOrders = async (request, response) => {
    const userId = request.user.id
    const page = Number(request.query.page) || 1
    const limit = Number(request.query.limit) || 10
    const result = await orderService.getUserOrders({ userId, page, limit })
    return response.status(200).json(result)
}

const getUserOrdersForAdmin = async (request, response) => {
    const { userId } = request.params
    const page = Number(request.query.page) || 1
    const limit = Number(request.query.limit) || 10
    const result = await orderService.getUserOrders({ userId, page, limit })
    return response.status(200).json(result)
}

const getOrderById = async (request, response) => {
    const order = request.resource
    const retrievedOrder = await orderService.getOrderById({ order })
    return response.status(200).json(retrievedOrder)
}

const cancelOrder = async (request, response) => {
    const { orderId } = request.params
    const cancelledOrder = await orderService.cancelOrder({ orderId })
    return response.status(200).json({
        message: 'Order cancelled',
        order: cancelledOrder,
    })
}

const returnRequest = async (request, response) => {
    const order = request.resource
    const returnedOrder = await orderService.returnRequest({ ...request.body, order })
    return response.status(201).json({
        message: 'Return request submitted',
        order: returnedOrder,
    })
}

// Admin

const getAllOrders = async (request, response) => {
    const result = await orderService.getAllOrders({ ...request.query })
    return response.status(200).json(result)
}

const updateOrderDeliveryStatus = async (request, response) => {
    const { orderId } = request.params
    const { deliveryStatus } = request.body

    const updatedOrder = await orderService.updateOrderDeliveryStatus({
        orderId,
        deliveryStatus,
    })

    return response.status(200).json(updatedOrder)
}

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    cancelOrder,
    returnRequest,
    getAllOrders,
    updateOrderDeliveryStatus,
    getUserOrdersForAdmin,
}
