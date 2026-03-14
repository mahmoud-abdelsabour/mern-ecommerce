const reviewService = require('../services/review.service')

const createReview = async (request, response) => {
    const user = request.user
    const { productId } = request.params
    const { rating, comment } = request.body
    const review = await reviewService.createReview({ user, productId, rating, comment })
    return response.status(201).json(review)
}

const updateReview = async (request, response) => {
    const review = request.resource
    const { rating, comment } = request.body
    const updatedReview = await reviewService.updateReview({rating, comment, review})
    return response.status(200).json(updatedReview)
}

const deleteReview = async (request, response) => {
    const review = request.resource
    const result = await reviewService.deleteReview({ review })
    return response.status(200).json(result)
}

module.exports = {
    createReview,
    updateReview,
    deleteReview
}