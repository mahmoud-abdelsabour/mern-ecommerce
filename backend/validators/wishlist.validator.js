const Joi = require('joi')

const addToWishlistSchema = Joi.object({
    productId: Joi.string().required()
})

module.exports = {
    addToWishlistSchema
} 