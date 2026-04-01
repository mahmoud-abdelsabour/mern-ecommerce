const Joi = require('joi')

const createReviewSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(1000).trim().allow(''),
})

const updateReviewSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5),
    comment: Joi.string().max(1000).trim().allow('', null),
}).min(1)

module.exports = {
    createReviewSchema,
    updateReviewSchema,
}
