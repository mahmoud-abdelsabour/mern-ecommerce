const express = require('express')
const brandController = require('../../controllers/brand.controller')
const brandValidator = require('../../validators/brand.validator')
const { asyncWrapper, validate, auth, role } = require('../../utils/middleware/index')
//api/admin/brands
const router = express.Router()

/**
 * @swagger
 * /api/admin/brands:
 *   post:
 *     summary: Create a brand
 *     tags: [Admin Brands]
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
 *               logo: { type: string, nullable: true }
 *     responses:
 *       201:
 *         description: Brand created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
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
    validate(brandValidator.createBrandSchema),
    asyncWrapper(brandController.createBrand)
)

/**
 * @swagger
 * /api/admin/brands:
 *   get:
 *     summary: Get all brands (with filters)
 *     tags: [Admin Brands]
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
 *         name: includeDeleted
 *         schema: { type: boolean }
 *       - in: query
 *         name: onlyDeleted
 *         schema: { type: boolean }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: hasProducts
 *         schema: { type: boolean }
 *       - in: query
 *         name: minProducts
 *         schema: { type: number }
 *       - in: query
 *         name: maxProducts
 *         schema: { type: number }
 *       - in: query
 *         name: sort
 *         schema: { type: object }
 *         description: JSON string or object
 *     responses:
 *       200:
 *         description: Brands list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BrandsListResponse'
 */
router.get(
    '/',
    auth,
    role('admin'),
    asyncWrapper(brandController.getAllBrands)
)

/**
 * @swagger
 * /api/admin/brands/{brandId}:
 *   get:
 *     summary: Get brand by id (with productsCount)
 *     tags: [Admin Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Brand data
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Brand'
 *                 - type: object
 *                   properties:
 *                     productsCount: { type: number }
 *       404:
 *         description: Brand not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
    '/:brandId',
    auth,
    role('admin'),
    asyncWrapper(brandController.getBrandById)
)

/**
 * @swagger
 * /api/admin/brands/{brandId}:
 *   patch:
 *     summary: Update brand
 *     tags: [Admin Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
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
 *               logo: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: Brand updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       404:
 *         description: Brand not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
    '/:brandId',
    auth,
    role('admin'),
    validate(brandValidator.updateBrandSchema),
    asyncWrapper(brandController.updateBrand)
)

/**
 * @swagger
 * /api/admin/brands/{brandId}:
 *   delete:
 *     summary: Soft delete brand
 *     tags: [Admin Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Brand deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       404:
 *         description: Brand not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
    '/:brandId',
    auth,
    role('admin'),
    asyncWrapper(brandController.deleteBrand)
)

/**
 * @swagger
 * /api/admin/brands/{brandId}/restore:
 *   patch:
 *     summary: Restore soft-deleted brand
 *     tags: [Admin Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Brand restored
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       404:
 *         description: Brand not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
    '/:brandId/restore',
    auth,
    role('admin'),
    asyncWrapper(brandController.restoreBrand)
)

module.exports = router
