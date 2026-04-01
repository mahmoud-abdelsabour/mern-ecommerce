const { api, waitForDb, createUser, getAuthToken, dropDatabase, closeDb } = require('../helper')
const User = require('../../models/user.model')

beforeAll(async () => {
    await waitForDb()
})

beforeEach(async () => {
    await dropDatabase()
})

afterAll(async () => {
    await closeDb()
})

describe('PATCH /api/auth/users/:id/update-password', () => {
    it('updates password with valid credentials', async () => {
        const { user, payload } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .patch(`/api/auth/users/${user.id}/update-password`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                currentPassword: payload.password,
                newPassword: 'Aa1@bbbb',
            })
            .expect(200)

        expect(response.body).toHaveProperty('id')
        expect(response.body).not.toHaveProperty('passwordHash')
    })

    it('increments tokenVersion after password update', async () => {
        const { user, payload } = await createUser()
        const token = getAuthToken(user)
        const oldTokenVersion = user.tokenVersion

        await api
            .patch(`/api/auth/users/${user.id}/update-password`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                currentPassword: payload.password,
                newPassword: 'Aa1@bbbb',
            })
            .expect(200)

        const updatedUser = await User.findById(user.id)
        expect(updatedUser.tokenVersion).toBe(oldTokenVersion + 1)
    })

    it('rejects invalid current password', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .patch(`/api/auth/users/${user.id}/update-password`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                currentPassword: 'WrongPass1@',
                newPassword: 'Aa1@bbbb',
            })
            .expect(401)

        expect(response.body.message || response.body.error).toBeDefined()
    })

    it('rejects invalid new password format', async () => {
        const { user, payload } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .patch(`/api/auth/users/${user.id}/update-password`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                currentPassword: payload.password,
                newPassword: 'password',
            })
            .expect(400)

        expect(response.body.message).toBe('Validation error')
    })

    it('rejects missing auth token', async () => {
        const { user, payload } = await createUser()

        const response = await api
            .patch(`/api/auth/users/${user.id}/update-password`)
            .send({
                currentPassword: payload.password,
                newPassword: 'Aa1@bbbb',
            })
            .expect(401)

        expect(response.body.message || response.body.error).toBeDefined()
    })

    it('rejects updating another user (ownership)', async () => {
        const { user: userA, payload } = await createUser()
        const { user: userB } = await createUser()
        const token = getAuthToken(userA)

        const response = await api
            .patch(`/api/auth/users/${userB.id}/update-password`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                currentPassword: payload.password,
                newPassword: 'Aa1@bbbb',
            })
            .expect(403)

        expect(response.body.message || response.body.error).toBeDefined()
    })
})
