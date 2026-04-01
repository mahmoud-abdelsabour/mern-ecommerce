const express = require('express')
const categoryController = require('../../controllers/category.controller')
const { asyncWrapper, auth, role, validate } = require('../../utils/middleware')
const categoryValidator = require('../../validators/category.validator')
//api/admin/categories
const router = express.Router()

// create category
/**
 * @swagger
 * /api/admin/categories:
 *   post:
 *     summary: Create a category
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       201:
 *         description: Category created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */
router.post(
    '/',
    auth,
    role('admin'),
    validate(categoryValidator.createCategorySchema),
    asyncWrapper(categoryController.createCategory)
)

// get all categories
/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: Get all categories (with filters)
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: number }
 *       - in: query
 *         name: limit
 *         schema: { type: number }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: hasProducts
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Categories list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriesListResponse'
 */
router.get(
    '/',
    auth,
    role('admin'),
    asyncWrapper(categoryController.getAllCategories)
)

// update category
/**
 * @swagger
 * /api/admin/categories/{categoryId}:
 *   patch:
 *     summary: Update category
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               name: { type: string }
 *     responses:
 *       200:
 *         description: Category updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
    '/:categoryId',
    auth,
    role('admin'),
    validate(categoryValidator.updateCategorySchema),
    asyncWrapper(categoryController.updateCategory)
)

// delete category
/**
 * @swagger
 * /api/admin/categories/{categoryId}:
 *   delete:
 *     summary: Delete category
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Category deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
    '/:categoryId',
    auth,
    role('admin'),
    asyncWrapper(categoryController.deleteCategory)
)

module.exports = router
