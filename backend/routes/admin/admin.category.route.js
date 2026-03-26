const express = require('express')
const categoryController = require('../../controllers/category.controller')
const { asyncWrapper, auth, role, validate } = require('../../utils/middleware')
const categoryValidator = require('../../validators/category.validator')
//api/admin/categories
const router = express.Router()

// create category
router.post(
    '/',
    auth,
    role('admin'),
    validate(categoryValidator.createCategorySchema),
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
    validate(categoryValidator.updateCategorySchema),
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
