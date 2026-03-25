const Joi = require('joi')

const createBrandSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    logo: Joi.string().uri({ scheme: ['http', 'https'] }).allow('', null),
})

const updateBrandSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100),
    logo: Joi.string().uri({ scheme: ['http', 'https'] }).allow('', null)
}).min(1)

module.exports = {
    createBrandSchema,
    updateBrandSchema
}