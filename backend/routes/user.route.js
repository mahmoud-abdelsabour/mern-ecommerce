const userController = require('../controllers/user.controller')
const { asyncWrapper, validate, auth } = require('../utils/middleware/index')
const userValidator = require('../validators/user.validator')
const express = require('express')

const router = express.Router()

router.get(
    '/',
    auth,
    asyncWrapper(userController.getUserProfile)
)

router.patch(
    '/update-profile',
    auth,
    validate(userValidator.updateProfileSchema),
    asyncWrapper(userController.updateProfile)
)

router.post(
    '/create-address',
    auth,
    validate(userValidator.createAddressSchema),
    asyncWrapper(userController.createAddress)
)

router.patch(
    '/:addressId/update-address',
    auth,
    validate(userValidator.updateAddressSchema),
    asyncWrapper(userController.updateAddress)
)

module.exports = router
