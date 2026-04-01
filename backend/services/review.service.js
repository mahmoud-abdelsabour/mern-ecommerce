const mongoose = require('mongoose')
const Review = require('../models/review.model')
const Order = require('../models/order.model')
const { updateProductRating } = require('./product.service')

const getAllReviews = async data => {
    try {
        const { productId, page = 1, limit = 10, sort = { createdAt: -1 } } = data

        const pageNumber = Math.max(Number(page) || 1, 1)
        const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100)
        const skip = (pageNumber - 1) * pageSize

        const [reviews, totalReviews] = await Promise.all([
            Review.find({ product: productId })
                .sort(sort)
                .skip(skip)
                .limit(pageSize)
                .populate('user', 'name'),
            Review.countDocuments({ product: productId }),
        ])

        return {
            reviews,
            pagination: {
                page: pageNumber,
                limit: pageSize,
                total: totalReviews,
                totalPages: Math.ceil(totalReviews / pageSize),
                hasMore: skip + reviews.length < totalReviews,
            },
        }
    } catch (error) {
        throw error
    }
}

const createReview = async ({ user, productId, rating, comment }) => {
    const userId = user.id

    const hasBought = await Order.exists({
        userId,
        'products.product': productId,
        deliveryStatus: { $in: ['delivered', 'return requested', 'returned', 'refunded'] },
    })

    if (!hasBought) {
        throw Object.assign(new Error('only buyers can review products'), { statusCode: 403 })
    }

    const alreadyReviewed = await Review.exists({ user: userId, product: productId })
    if (alreadyReviewed) {
        throw Object.assign(new Error('product already reviewed'), { statusCode: 409 })
    }

    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const review = new Review({
            user: userId,
            product: productId,
            rating,
            comment: comment || '',
            name: user.firstName,
        })

        const savedReview = await review.save({ session })

        await updateProductRating({ productId, rating, session })

        await session.commitTransaction()
        return savedReview
    } catch (err) {
        await session.abortTransaction()
        throw err
    } finally {
        session.endSession()
    }
}

const updateReview = async ({ rating, comment, review }) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        if (rating !== undefined) review.rating = rating
        if (comment !== undefined) review.comment = comment

        const savedReview = await review.save({ session })

        await updateProductRating({ productId: review.product, session })

        await session.commitTransaction()
        return savedReview
    } catch (err) {
        await session.abortTransaction()
        throw err
    } finally {
        session.endSession()
    }
}

const deleteReview = async ({ review }) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        await review.deleteOne({ session })

        await updateProductRating({ productId: review.product, session })

        await session.commitTransaction()
        return { message: 'review deleted' }
    } catch (err) {
        await session.abortTransaction()
        throw err
    } finally {
        session.endSession()
    }
}

module.exports = {
    createReview,
    updateReview,
    deleteReview,
    getAllReviews,
}
