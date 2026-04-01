const express = require('express')
const productController = require('../../controllers/product.controller')
const productValidator = require('../../validators/product.validator')
const { asyncWrapper, validate, auth, role } = require('../../utils/middleware')
// api/admin/products
const router = express.Router()

// create product
/**
 * @swagger
 * /api/admin/products:
 *   post:
 *     summary: Create product
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, photos, description, category, brand, stock]
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               photos:
 *                 type: array
 *                 items: { type: string }
 *               description: { type: string }
 *               category: { type: string }
 *               brand: { type: string }
 *               stock: { type: number }
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error / bad ids
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */
router.post(
    '/',
    auth,
    role('admin'),
    validate(productValidator.createProductSchema),
    asyncWrapper(productController.createProduct)
)

// get all products
/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: Get all products (admin filters)
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: brand
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: minRating
 *         schema: { type: number }
 *       - in: query
 *         name: includeDeleted
 *         schema: { type: boolean }
 *       - in: query
 *         name: onlyDeleted
 *         schema: { type: boolean }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: number }
 *       - in: query
 *         name: limit
 *         schema: { type: number }
 *       - in: query
 *         name: sort
 *         schema: { type: object }
 *     responses:
 *       200:
 *         description: Products list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductsListResponse'
 */
router.get('/', auth, role('admin'), asyncWrapper(productController.getProducts))

// get product by id
/**
 * @swagger
 * /api/admin/products/{productId}:
 *   get:
 *     summary: Get product by id (admin)
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductDetailResponse'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:productId', auth, role('admin'), asyncWrapper(productController.getProductById))

// update product
/**
 * @swagger
 * /api/admin/products/{productId}:
 *   patch:
 *     summary: Update product
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
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
 *               price: { type: number }
 *               photos:
 *                 type: array
 *                 items: { type: string }
 *               description: { type: string }
 *               category: { type: string }
 *               brand: { type: string }
 *               stock: { type: number }
 *     responses:
 *       200:
 *         description: Product updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product/brand/category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
    '/:productId',
    auth,
    role('admin'),
    validate(productValidator.updateProductSchema),
    asyncWrapper(productController.updateProduct)
)

// delete product
/**
 * @swagger
 * /api/admin/products/{productId}:
 *   delete:
 *     summary: Soft delete product
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:productId', auth, role('admin'), asyncWrapper(productController.deleteProduct))

// restore product
/**
 * @swagger
 * /api/admin/products/{productId}/restore:
 *   patch:
 *     summary: Restore soft-deleted product
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product restored
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Brand is deleted; restore brand first
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
    '/:productId/restore',
    auth,
    role('admin'),
    asyncWrapper(productController.restoreProduct)
)

module.exports = router
