const orderService = require('../services/order.service')

const createOrder = async (request, response) => {
    const user = request.user
    const newOrder = await orderService.placeOrder({ ...request.body, user })
    return response.status(201).json(newOrder)
}

const getOrders = async (request, response) => {
    const { userId } = request.user.id
    const page = Number(request.query.page) || 1
    const limit = Number(request.query.limit) || 10
    const result = await orderService.getUserOrders({userId, page, limit})
    return response.status(200).json(result)
}

const getOrderById = async (request, response) => {
    const {orderId} = request.params
    const order = await orderService.getOrderById({orderId})
    return response.status(200).json(order)
}

const cancelOrder = async (request, response) => {
    const {orderId} = request.params
    const cancelledOrder = await orderService.cancelOrder({orderId})
    return response.status(200).json({
      message: 'Order cancelled',
      order: cancelledOrder
    })
}

const returnRequest = async (request, response) => {
    const {orderId} = request.params
    const returnedOrder = await orderService.returnRequest({...request.body, orderId})
    return response.status(201).json({
      message: 'Return request submitted',
      order: returnedOrder
    })
}

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    cancelOrder,
    returnRequest
}