const express = require('express')
const userController = require('../../controllers/user.controller')
const { asyncWrapper, auth, role } = require('../../utils/middleware/index')
//api/admin/users
const router = express.Router()

router.get(
    '/',
    auth,
    role('admin'),
    asyncWrapper(userController.getAllUsers)
)

router.patch(
    '/:userId/make-admin',
    auth,
    role('admin'),
    asyncWrapper(userController.makeAdmin)
)

router.get(
    '/:userId',
    auth,
    role('admin'),
    asyncWrapper(userController.getUserById)
)

module.exports = router
