const Order = require('../models/order.model')
const Product = require('../models/product.model')
const mongoose = require('mongoose')

//  expected data (Request Body)
//  {
//      "products": [
//          {"product1": "productID1", "quantity": 2}
//      ]
//  }

const placeOrder = async (data) => {

    const session = await mongoose.startSession()
    session.startTransaction()

    try {

        const { products, shippingInfo, user } = data
        const userId = user.id

        let totalPrice = 0
        const orderProducts = []

        for (const item of products) {

            const product = await Product.findOneAndUpdate(
                {
                    _id: item.product,
                    stock: { $gte: item.quantity }
                },
                {
                    $inc: { stock: -item.quantity }
                },
                { new: true, session }
            )

            if(!product) {
                throw Object.assign(new Error('not enough stock'), { statusCode: 409 })
            }

            orderProducts.push({
                product: product.id,
                quantity: item.quantity,
                priceAtPurchase: product.price,
                name: product.name,
                description: product.description,
                photos: product.photos,
                brand: product.brand,
                category: product.category
            })

            totalPrice += product.price * item.quantity
        }

        const order = new Order({
            products: orderProducts,
            userId,
            shippingInfo,
            totalPrice
        })

        await order.save({ session })

        await session.commitTransaction()
        session.endSession()

        return order

    } catch (error) {

        await session.abortTransaction()
        session.endSession()
        throw error

    }
}

const getUserOrders = async (data) => {
    const { userId, page, limit } = data
    const skip = (page -1) * limit

    const [orders, totalOrders] = await Promise.all([
        Order.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

        Order.countDocuments({userId})
    ]) 

    const totalPages = Math.ceil(totalOrders / limit)

    return {
        orders,
        pagination: {
            totalOrders,
            totalPages,
            currentPage: page,
            limit
        }
    }
}

const getOrderById = async (data) => {
    const { orderId } = data
    const order = await Order.findById(orderId)
    if(!order){
        throw Object.assign(new Error('order not found'), { statusCode: 404 })
    }
    return order
}

const cancelOrder = async (data) => {
    const { orderId } = data

    const order = await Order.findOneAndUpdate(
        { _id: orderId, deliveryStatus: 'pending' },
        { $set: { deliveryStatus: 'cancelled' } },
        { new: true }
    )

    if (!order) {
        throw Object.assign(new Error('order is not pending or not found'), { statusCode: 409 })
    }

    return order
}

const requestReturn = async (data) => {
    const { orderId, returnedItems } = data

    const order = await Order.findById(orderId)
    if (!order) throw Object.assign(new Error('order not found'), { statusCode: 404 })
        
    if (order.deliveryStatus !== 'delivered') {
        throw Object.assign(new Error('order not delivered yet or already requested a return'), { statusCode: 400 })
    }

    const orderProductsMap = new Map(
        order.products.map(p => [String(p.product), p.quantity])
    )

    for (const item of returnedItems) {
        const boughtQty = orderProductsMap.get(String(item.product))
        if (!boughtQty) throw Object.assign(new Error('product not in order'), { statusCode: 400 })
        if (item.quantity > boughtQty) throw Object.assign(new Error('return quantity exceeds purchased quantity'), { statusCode: 400 })
    }

    const deliveredAt = order.deliveredAt
    if (!deliveredAt) {
        throw Object.assign(new Error('missing delivery date'), { statusCode: 400 })
    }

    const days = (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24)
    if (days > 14) {
        throw Object.assign(new Error('return window expired'), { statusCode: 400 })
    }

    order.deliveryStatus = 'return requested'
    order.returnInfo = {
        returnedItems,
        returnDate: null
    }

    await order.save()
    return order
}


module.exports = {
    placeOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    requestReturn
}