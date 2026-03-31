const { api, waitForDb, createUser, getAuthToken, logIfServerError, closeDb,dropDatabase  } = require('../helper')

beforeAll(async () => {
    await waitForDb()
})

beforeEach(async () => {
    await dropDatabase()
})

afterAll(async () => {
    await closeDb()
})

describe('PATCH /api/users/me/update-profile', () => {
    it('returns 401 when no token', async () => {
        const response = await api.patch('/api/users/me/update-profile').send({})
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 400 on validation error (empty body)', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .patch('/api/users/me/update-profile')
            .set('Authorization', `Bearer ${token}`)
            .send({})

        logIfServerError(response)
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Validation error')
    })

    it('returns 400 on unknown fields', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .patch('/api/users/me/update-profile')
            .set('Authorization', `Bearer ${token}`)
            .send({ isAdmin: true })

        logIfServerError(response)
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Validation error')
    })

    it('updates allowed fields', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .patch('/api/users/me/update-profile')
            .set('Authorization', `Bearer ${token}`)
            .send({ firstName: 'New', lastName: 'Name' })

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.firstName).toBe('New')
        expect(response.body.lastName).toBe('Name')
        expect(response.body.passwordHash).toBeUndefined()
    })

    it('increments tokenVersion when email updated', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)
        const oldTokenVersion = user.tokenVersion

        const response = await api
            .patch('/api/users/me/update-profile')
            .set('Authorization', `Bearer ${token}`)
            .send({ email: `new_${Date.now()}@example.com` })

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.tokenVersion).toBe(oldTokenVersion + 1)
    })
})

