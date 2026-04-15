const Joi = require('joi')

const updateProfileSchema = Joi.object({
    firstName: Joi.string().trim(),
    lastName: Joi.string().trim(),
    username: Joi.string().min(3).max(30).trim(),
    email: Joi.string()
        .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        .trim(),
    phone: Joi.string()
        .pattern(/^01[0125][0-9]{8}$/)
        .min(11)
        .trim(),
    profilePhoto: Joi.alternatives()
        .try(Joi.string().uri({ scheme: ['http', 'https'] }), Joi.valid(null, ''))
        .messages({ 'alternatives.match': 'profilePhoto must be a valid http(s) URL' }),
}).min(1)

const createAddressSchema = Joi.object({
    country: Joi.string().trim().required(),
    address_name: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    postalcode: Joi.string().trim().required(),
    street: Joi.string().trim().required(),
    building: Joi.string().trim().required(),
    floor: Joi.number().integer().required(),
    special_mark: Joi.string().trim().allow(''),
})

const updateAddressSchema = Joi.object({
    country: Joi.string().trim(),
    address_name: Joi.string().trim(),
    city: Joi.string().trim(),
    postalcode: Joi.string().trim(),
    street: Joi.string().trim(),
    building: Joi.string().trim(),
    floor: Joi.number().integer(),
    special_mark: Joi.string().trim().allow(''),
}).min(1)

module.exports = {
    updateProfileSchema,
    createAddressSchema,
    updateAddressSchema,
}
