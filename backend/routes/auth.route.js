const authController = require('../controllers/auth.controller')
const { asyncWrapper, validate, auth, ownership } = require('../utils/middleware/index')
const authValidator = require('../validators/auth.validator')
const User = require('../models/user.model')
const express = require('express')

const router = express.Router()

router.post(
    '/register',
    validate(authValidator.registerSchema),
    asyncWrapper(authController.register)
)

router.post(
    '/login',
    validate(authValidator.loginSchema),
    asyncWrapper(authController.login)
)

router.patch(
    '/user/:id/update-password',
    auth,
    ownership(User, 'id', '_id'),
    validate(authValidator.updatePasswordSchema),
    asyncWrapper(authController.updatePassword)
)