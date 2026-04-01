const express = require('express')
const userController = require('../../controllers/user.controller')
const { asyncWrapper, auth, role } = require('../../utils/middleware/index')
//api/admin/users
const router = express.Router()

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (admin)
 *     tags: [Admin Users]
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
 *         name: role
 *         schema: { type: string }
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
 *         name: startDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: hasOrders
 *         schema: { type: boolean }
 *       - in: query
 *         name: minOrders
 *         schema: { type: number }
 *       - in: query
 *         name: maxOrders
 *         schema: { type: number }
 *       - in: query
 *         name: sortOrders
 *         schema: { type: string, enum: [high, low] }
 *     responses:
 *       200:
 *         description: Users list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersListResponse'
 */
router.get(
    '/',
    auth,
    role('admin'),
    asyncWrapper(userController.getAllUsers)
)

/**
 * @swagger
 * /api/admin/users/{userId}/make-admin:
 *   patch:
 *     summary: Promote user to admin
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User promoted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: User is deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
    '/:userId/make-admin',
    auth,
    role('admin'),
    asyncWrapper(userController.makeAdmin)
)

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   get:
 *     summary: Get user by id (admin)
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
    '/:userId',
    auth,
    role('admin'),
    asyncWrapper(userController.getUserById)
)

module.exports = router
