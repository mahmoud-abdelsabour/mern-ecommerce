const Joi = require('joi')

const createCategorySchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
})

const updateCategorySchema = Joi.object({
    name: Joi.string().trim().min(2).max(100),
}).min(1)

module.exports = {
    createCategorySchema,
    updateCategorySchema,
}
