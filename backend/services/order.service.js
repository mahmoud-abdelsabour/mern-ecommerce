const mongoose = require('mongoose')
const Order = require('../models/order.model')
const Product = require('../models/product.model')
const Brand = require('../models/brand.model')
const Category = require('../models/category.model')

const OBJECT_ID_HEX = /^[a-fA-F0-9]{24}$/
const DEFAULT_SHIPPING_PRICE = 25
const DEFAULT_COD_FEES = 10

const snapshotBrandCategory = product => {
    const b = product.brand
    const c = product.category
    const brandName = b && typeof b === 'object' && b.name != null ? String(b.name) : String(b ?? '')
    const categoryName = c && typeof c === 'object' && c.name != null ? String(c.name) : String(c ?? '')
    return { brandName, categoryName }
}

const resolveStoredLabel = async (value, Model) => {
    if (value == null || value === '') return '—'
    const s = String(value).trim()
    if (!OBJECT_ID_HEX.test(s)) return s
    const doc = await Model.findById(s).select('name').lean()
    return doc?.name ?? '—'
}

const enrichOrderProducts = async order => {
    if (!order?.products?.length) return order
    // Use `toJSON()` so the same transform runs as `res.json(order)` (adds `id`, drops `_id`).
    const plain = typeof order.toJSON === 'function' ? order.toJSON() : order.toObject ? order.toObject() : { ...order }
    const products = await Promise.all(
        plain.products.map(async p => ({
            ...p,
            brand: await resolveStoredLabel(p.brand, Brand),
            category: await resolveStoredLabel(p.category, Category),
        }))
    )
    return { ...plain, products }
}

//  expected data (Request Body)
//  {
//      "products": [
//          {"product1": "productID1", "quantity": 2}
//      ]
//  }

const placeOrder = async data => {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const { products, shippingInfo, user, source = 'cart', paymentMethod = 'COD' } = data
        const userId = user.id
        const normalizedSource = String(source || 'cart')
        const normalizedPaymentMethod = paymentMethod === 'Credit' ? 'Credit' : 'COD'

        // The frontend may only send address + name + phone.
        // Ensure required fields are present using the authenticated user record.
        const normalizedShippingInfo = {
            ...(shippingInfo || {}),
            username: shippingInfo?.username || user.username,
            email: shippingInfo?.email || user.email,
        }

        let subtotal = 0
        const orderProducts = []

        for (const item of products) {
            const product = await Product.findOneAndUpdate(
                {
                    _id: item.product,
                    stock: { $gte: item.quantity },
                },
                {
                    $inc: { stock: -item.quantity },
                },
                { new: true, session }
            )

            if (!product) {
                throw Object.assign(new Error('not enough stock'), { statusCode: 409 })
            }

            await product.populate([
                { path: 'brand', select: 'name' },
                { path: 'category', select: 'name' },
            ])
            const { brandName, categoryName } = snapshotBrandCategory(product)

            orderProducts.push({
                product: product.id,
                quantity: item.quantity,
                priceAtPurchase: product.price,
                name: product.name,
                description: product.description,
                photos: product.photos,
                brand: brandName,
                category: categoryName,
            })

            subtotal += product.price * item.quantity
        }

        const shippingPrice = DEFAULT_SHIPPING_PRICE
        const codFees = normalizedPaymentMethod === 'COD' ? DEFAULT_COD_FEES : 0
        const totalPrice = subtotal + shippingPrice + codFees

        const order = new Order({
            products: orderProducts,
            userId,
            shippingInfo: normalizedShippingInfo,
            subtotal,
            shippingPrice,
            codFees,
            paymentMethod: normalizedPaymentMethod,
            totalPrice,
        })

        await order.save({ session })
        // Preserve cart when order comes from the buy-now flow.
        if (normalizedSource !== 'buyNow') {
            user.cart = []
            await user.save({ session })
        }

        await session.commitTransaction()
        session.endSession()

        return order
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
    }
}

const ORDER_SORT_KEYS = new Set(['date-desc', 'date-asc', 'price-desc', 'price-asc'])

const DELIVERY_FILTER_KEYS = new Set([
    'pending',
    'shipped',
    'delivered',
    'cancelled',
    'return requested',
    'returned',
    'refunded',
])

const buildUserOrdersSort = sort => {
    const key = String(sort || 'date-desc').toLowerCase()
    if (!ORDER_SORT_KEYS.has(key)) {
        return { createdAt: -1 }
    }
    if (key === 'date-asc') return { createdAt: 1 }
    if (key === 'price-desc') return { totalPrice: -1, createdAt: -1 }
    if (key === 'price-asc') return { totalPrice: 1, createdAt: -1 }
    return { createdAt: -1 }
}

const getUserOrders = async data => {
    try {
        const { userId, page, limit, sort, deliveryStatus } = data

        const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100)

        const filter = { userId }
        const statusKey = String(deliveryStatus || '').toLowerCase()
        if (statusKey && statusKey !== 'all' && DELIVERY_FILTER_KEYS.has(statusKey)) {
            filter.deliveryStatus = statusKey
        }

        const sortSpec = buildUserOrdersSort(sort)

        const totalOrders = await Order.countDocuments(filter)
        const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize))

        let pageNumber = Math.max(Number(page) || 1, 1)
        if (pageNumber > totalPages) pageNumber = totalPages

        const skip = (pageNumber - 1) * pageSize

        const orders = await Order.find(filter).sort(sortSpec).skip(skip).limit(pageSize)

        return {
            orders,
            pagination: {
                totalOrders,
                totalPages,
                currentPage: pageNumber,
                limit: pageSize,
                hasMore: skip + orders.length < totalOrders,
            },
        }
    } catch (error) {
        throw error
    }
}

const getOrderById = async data => {
    try {
        const { order } = data
        if (!order) {
            throw Object.assign(new Error('order not found'), { statusCode: 404 })
        }
        return enrichOrderProducts(order)
    } catch (error) {
        throw error
    }
}

const cancelOrder = async data => {
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

const requestReturn = async data => {
    try {
        const { returnedItems, order, reason = '' } = data

        if (!order) throw Object.assign(new Error('order not found'), { statusCode: 404 })

        if (order.deliveryStatus !== 'delivered') {
            throw Object.assign(
                new Error('order not delivered yet or already requested a return'),
                { statusCode: 400 }
            )
        }

        const orderProductsMap = new Map(order.products.map(p => [String(p.product), p.quantity]))

        for (const item of returnedItems) {
            const boughtQty = orderProductsMap.get(String(item.product))
            if (!boughtQty)
                throw Object.assign(new Error('product not in order'), { statusCode: 400 })
            if (item.quantity > boughtQty)
                throw Object.assign(new Error('return quantity exceeds purchased quantity'), {
                    statusCode: 400,
                })
        }

        const { deliveredAt } = order
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
            reason: String(reason || '').trim().slice(0, 300),
            returnDate: null,
        }

        await order.save()
        return order
    } catch (error) {
        throw error
    }
}

const getAllOrders = async data => {
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
            sort = { createdAt: -1 },
        } = data

        const pageNumber = Math.max(Number(page) || 1, 1)
        const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100)
        const skip = (pageNumber - 1) * pageSize

        const filter = {}

        if (deliveryStatus) filter.deliveryStatus = deliveryStatus
        if (userId) filter.userId = new mongoose.Types.ObjectId(userId)

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
            Order.aggregate([
                { $match: filter },
                {
                    $project: {
                        createdAt: 1,
                        deliveryStatus: 1,
                        totalPrice: 1,
                        firstPhoto: { $arrayElemAt: ['$products.photos', 0] },
                    },
                },
                { $sort: sortObj },
                { $skip: skip },
                { $limit: pageSize },
            ]),
            Order.countDocuments(filter),
        ])

        return {
            orders,
            pagination: {
                totalOrders,
                totalPages: Math.ceil(totalOrders / pageSize),
                currentPage: pageNumber,
                limit: pageSize,
                hasMore: skip + orders.length < totalOrders,
            },
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
            pending: ['shipped'], // admin can ship
            shipped: ['delivered'], // admin can deliver
            delivered: [], // admin cannot initiate return
            'return requested': ['returned'], // admin can confirm return
            returned: ['refunded'], // admin can refund
            refunded: [],
            cancelled: [], // user-only
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
    updateOrderDeliveryStatus,
}
