const express = require('express')
const userController = require('../controllers/user.controller')
const { asyncWrapper, validate, auth } = require('../utils/middleware/index')
const userValidator = require('../validators/user.validator')

const router = express.Router()
// api/users
/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get authenticated user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/me', auth, asyncWrapper(userController.getUserProfile))

/**
 * @swagger
 * /api/users/me/update-profile:
 *   patch:
 *     summary: Update authenticated user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               username: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               profilePhoto: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: Updated user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */
router.patch(
    '/me/update-profile',
    auth,
    validate(userValidator.updateProfileSchema),
    asyncWrapper(userController.updateProfile)
)

/**
 * @swagger
 * /api/users/me/create-address:
 *   post:
 *     summary: Add a new address to user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Address'
 *     responses:
 *       200:
 *         description: User with added address
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */
router.post(
    '/me/create-address',
    auth,
    validate(userValidator.createAddressSchema),
    asyncWrapper(userController.createAddress)
)

/**
 * @swagger
 * /api/users/me/addresses/{addressId}:
 *   patch:
 *     summary: Update an existing address
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
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
 *               address_name: { type: string }
 *               country: { type: string }
 *               city: { type: string }
 *               postalcode: { type: string }
 *               street: { type: string }
 *               building: { type: string }
 *               floor: { type: number }
 *               special_mark: { type: string }
 *     responses:
 *       200:
 *         description: Updated user with addresses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User or address not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
    '/me/addresses/:addressId',
    auth,
    validate(userValidator.updateAddressSchema),
    asyncWrapper(userController.updateAddress)
)

/**
 * @swagger
 * /api/users/me/delete:
 *   delete:
 *     summary: Soft delete authenticated user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted (scrubbed)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.delete('/me/delete', auth, asyncWrapper(userController.deleteUser))

module.exports = router
