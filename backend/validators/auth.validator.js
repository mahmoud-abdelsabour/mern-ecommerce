const Joi = require("joi");

const registerSchema = Joi.object({
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),
    email: Joi.string().trim().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).required(),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .required(),
    phone: Joi.string()
        .pattern(/^01[0125][0-9]{8}$/)
        .min(11)
        .required(),
    username: Joi.string().min(3).max(30).required()
});

const loginSchema = Joi.object({
    email: Joi.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).required(),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .required(),

})

const updateProfileSchema = Joi.object({
    firstName: Joi.string().trim(),
    lastName: Joi.string().trim(),
    username: Joi.string().min(3).max(30).trim(),
    email: Joi.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).trim(),
    phone: Joi.string().pattern(/^01[0125][0-9]{8}$/).min(11).trim(),
    profilePhoto: Joi.string().trim().allow(null, "")
}).min(1);

const updatePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi
    .string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required(),

})

const createAddressSchema = Joi.object({
    country: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    postalcode: Joi.string().trim().required(),
    street: Joi.string().trim().required(),
    building: Joi.string().trim().required(),
    floor: Joi.number().required(),
    special_mark: Joi.string().trim().allow("")
});

const updateAddressSchema = Joi.object({
    country: Joi.string().trim(),
    city: Joi.string().trim(),
    postalcode: Joi.string().trim(),
    street: Joi.string().trim(),
    building: Joi.string().trim(),
    floor: Joi.number(),
    special_mark: Joi.string().trim().allow("")

}).min(1)

module.exports = { registerSchema, loginSchema, updateProfileSchema, createAddressSchema, updateAddressSchema };
