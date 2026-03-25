const express = require('express')
const categoryController = require('../../controllers/category.controller')
const { asyncWrapper, auth, role, validate } = require('../../utils/middleware')

const router = express.Router()

// create category
router.post(
    '/',
    auth,
    role('admin'),
    asyncWrapper(categoryController.createCategory)
)

// get all categories
router.get(
    '/',
    auth,
    role('admin'),
    asyncWrapper(categoryController.getAllCategories)
)

// update category
router.patch(
    '/:categoryId',
    auth,
    role('admin'),
    asyncWrapper(categoryController.updateCategory)
)

// delete category
router.delete(
    '/:categoryId',
    auth,
    role('admin'),
    asyncWrapper(categoryController.deleteCategory)
)

module.exports = router
