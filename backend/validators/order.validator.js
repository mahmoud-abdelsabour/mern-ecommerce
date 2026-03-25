const Joi = require('joi')

const createOrderSchema = Joi.object({
    products: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().required(),   // product ID
        quantity: Joi.number().integer().min(1).required()
      })
    )
    .min(1)
    .required(),

    shippingInfo: Joi.object({
        firstName: Joi.string().trim().required(),
        lastName: Joi.string().trim().required(),
        username: Joi.string().trim().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().trim().required(),
        address: Joi.object({
            country: Joi.string().trim().required(),
            city: Joi.string().trim().required(),
            postalcode: Joi.string().trim().required(),
            street: Joi.string().trim().required(),
            building: Joi.string().trim().required(),
            floor: Joi.number().integer().required(),
            special_mark: Joi.string().trim().required(),
        })
    })
})

const returnRequestSchema = Joi.object({
    returnedItems: Joi.array()
    .items(
        Joi.object({
            product: Joi.string().required(),
            quantity: Joi.number().integer().min(1).required(),
            reason: Joi.string().trim().max(300).allow('')
        })
    )
    .min(1)
    .required()
})

const updateOrderDeliveryStatusSchema = Joi.object({
    deliveryStatus: Joi.string()
        .valid('shipped', 'delivered', 'returned', 'refunded')
        .required()
})

module.exports = {
    createOrderSchema,
    returnRequestSchema,
    updateOrderDeliveryStatusSchema
}