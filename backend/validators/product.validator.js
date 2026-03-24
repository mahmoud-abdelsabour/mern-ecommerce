const Joi = require('joi')

const createProductSchema = Joi.object({
    name: Joi.string().trim().min(1).required(),
    price: Joi.number().positive().required(),
    photos: Joi.array()
        .items(Joi.string().uri({ scheme: ['http', 'https'] }))
        .min(1)
        .required(),
    description: Joi.string().trim().min(20).max(2000).required(),
    category: Joi.string().hex().length(24).required(),
    brand: Joi.string().hex().length(24).required(),
    stock: Joi.number().integer().min(0).required(),
    isActive: Joi.boolean()
})

module.exports = {
    createProductSchema
}