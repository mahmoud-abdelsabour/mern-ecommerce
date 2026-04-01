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
    isDeleted: Joi.boolean(),
})

const updateProductSchema = Joi.object({
    name: Joi.string().trim().min(1),
    price: Joi.number().positive(),
    photos: Joi.array()
        .items(Joi.string().uri({ scheme: ['http', 'https'] }))
        .min(1),
    description: Joi.string().trim().min(20).max(2000),
    category: Joi.string().hex().length(24),
    brand: Joi.string().hex().length(24),
    stock: Joi.number().integer().min(0),
    isDeleted: Joi.boolean(),
}).min(1)

module.exports = {
    createProductSchema,
    updateProductSchema,
}
