const Joi = require('joi')

const registerSchema = Joi.object({
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),
    email: Joi.string()
        .trim()
        .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        .required(),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .required(),
    phone: Joi.string()
        .pattern(/^01[0125][0-9]{8}$/)
        .min(11)
        .required(),
    username: Joi.string().min(3).max(30).required(),
})

const loginSchema = Joi.object({
    email: Joi.string()
        .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        .required(),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .required(),
})

const updatePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .required(),
})

module.exports = {
    registerSchema,
    loginSchema,
    updatePasswordSchema,
}
