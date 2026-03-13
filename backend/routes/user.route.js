const userController = require('../controllers/user.controller')
const { asyncWrapper, validate, auth, ownership } = require('../utils/middleware/index')
const userValidator = require('../validators/user.validator')
const User = require('../models/user.model')
const express = require('express')

const router = express.Router()

router.get(
    '/:id',
    auth,
    ownership(User, 'id', '_id'),
    asyncWrapper(userController.getUserProfile)
)

router.patch(
    '/:id/update-profile',
    auth,
    ownership(User, 'id', '_id'),
    validate(userValidator.updateProfileSchema),
    asyncWrapper(userController.updateProfile)
)

router.post(
    '/:id/create-address',
    auth,
    ownership(User, 'id', '_id'),
    validate(userValidator.createAddressSchema),
    asyncWrapper(userController.createAddress)
)

router.patch(
    '/:id/update-address',
    auth,
    ownership(User, 'id', '_id'),
    validate(userValidator.updateAddressSchema),
    asyncWrapper(userController.updateAddress)
)

module.exports = router
