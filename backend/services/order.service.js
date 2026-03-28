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
        user.cart = []
        await user.save({ session })

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
    try {
        const { userId, page, limit } = data
        
        const pageNumber = Math.max(Number(page) || 1, 1)
        const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100)
        const skip = (pageNumber - 1) * pageSize


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
                limit,
                hasMore: skip + orders.length < totalOrders
            }
        }
    } catch (error) {
        throw error
    }
}

const getOrderById = async (data) => {
    try {
        const { order } = data
        if(!order){
            throw Object.assign(new Error('order not found'), { statusCode: 404 })
        }
        return order
    } catch (error) {
        throw error
    }
}

const cancelOrder = async (data) => {
    try {
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
    } catch (error) {
        throw error
    }
}

const requestReturn = async (data) => {
    try {
        const { returnedItems, order } = data

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
    } catch (error) {
        throw error
    }
}

const getAllOrders = async (data) => {
    try {
        const {
            page = 1,
            limit = 10,
            deliveryStatus,
            userId,
            minTotal,
            maxTotal,
            startDate,
            endDate,
            sort = { createdAt: -1 }
        } = data

        const pageNumber = Math.max(Number(page) || 1, 1)
        const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100)
        const skip = (pageNumber - 1) * pageSize

        const filter = {}

        if (deliveryStatus) filter.deliveryStatus = deliveryStatus
        if (userId) filter.userId = userId

        if (minTotal || maxTotal) {
            filter.totalPrice = {}
            if (minTotal) filter.totalPrice.$gte = Number(minTotal)
            if (maxTotal) filter.totalPrice.$lte = Number(maxTotal)
        }

        if (startDate || endDate) {
            filter.createdAt = {}
            if (startDate) filter.createdAt.$gte = new Date(startDate)
            if (endDate) filter.createdAt.$lte = new Date(endDate)
        }

        let sortObj = { createdAt: -1 }
        if (sort) {
            if (typeof sort === 'object') {
                sortObj = sort
            } else if (typeof sort === 'string') {
                try {
                    sortObj = JSON.parse(sort)
                } catch (e) {
                    sortObj = { createdAt: -1 }
                }
            }
        }

        const [orders, totalOrders] = await Promise.all([
            Order.find(filter)
                .select('createdAt deliveryStatus totalPrice products.0.photos')
                .sort(sortObj)
                .skip(skip)
                .limit(pageSize),
            Order.countDocuments(filter)
        ])

        return {
            orders,
            pagination: {
                totalOrders,
                totalPages: Math.ceil(totalOrders / pageSize),
                currentPage: pageNumber,
                limit: pageSize,
                hasMore: skip + orders.length < totalOrders
            }
        }
    } catch (error) {
        throw error
    }
}

const updateOrderDeliveryStatus = async ({ orderId, deliveryStatus }) => {
    try {
        const order = await Order.findById(orderId)
        if (!order) {
            throw Object.assign(new Error('order not found'), { statusCode: 404 })
        }

        const allowedTransitions = {
            pending: ['shipped'],           // admin can ship
            shipped: ['delivered'],         // admin can deliver
            delivered: [],                  // admin cannot initiate return
            'return requested': ['returned'], // admin can confirm return
            returned: ['refunded'],         // admin can refund
            refunded: [],
            cancelled: []                   // user-only
        }


        const current = order.deliveryStatus
        const allowedNext = allowedTransitions[current] || []

        if (!allowedNext.includes(deliveryStatus)) {
            throw Object.assign(
                new Error(`invalid status transition from ${current} to ${deliveryStatus}`),
                { statusCode: 409 }
            )
        }

        const update = { deliveryStatus }

        if (deliveryStatus === 'shipped') {
            update.shippedAt = new Date()
        }

        if (deliveryStatus === 'delivered') {
            update.deliveredAt = new Date()
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { $set: update },
            { new: true, runValidators: true, context: 'query' }
        )

        return updatedOrder
    } catch (error) {
        throw error
    }
}


module.exports = {
    placeOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    requestReturn,
    returnRequest: requestReturn,
    getAllOrders,
    updateOrderDeliveryStatus
}
