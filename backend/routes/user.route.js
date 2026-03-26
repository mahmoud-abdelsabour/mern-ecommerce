const userController = require('../controllers/user.controller')
const { asyncWrapper, validate, auth } = require('../utils/middleware/index')
const userValidator = require('../validators/user.validator')
const express = require('express')

const router = express.Router()
//api/users
router.get(
    '/me',
    auth,
    asyncWrapper(userController.getUserProfile)
)

router.patch(
    '/me/update-profile',
    auth,
    validate(userValidator.updateProfileSchema),
    asyncWrapper(userController.updateProfile)
)

router.post(
    '/me/create-address',
    auth,
    validate(userValidator.createAddressSchema),
    asyncWrapper(userController.createAddress)
)

router.patch(
    '/me/addresses/:addressId',
    auth,
    validate(userValidator.updateAddressSchema),
    asyncWrapper(userController.updateAddress)
)

router.delete(
    '/me/delete',
    auth,
    asyncWrapper(userController.deleteUser)
)

module.exports = router
