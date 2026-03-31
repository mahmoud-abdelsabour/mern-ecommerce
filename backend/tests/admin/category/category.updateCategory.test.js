const {
    api,
    waitForDb,
    createUser,
    createCategory,
    getAuthToken,
    logIfServerError,
    mongoose,
    dropDatabase,
    closeDb
} = require('../../helper')

beforeAll(async () => {
    await waitForDb()
})

beforeEach(async () => {
    await dropDatabase()
})

afterAll(async () => {
    await closeDb()
})

describe('PATCH /api/admin/categories/:categoryId', () => {
    it('returns 401 when no token', async () => {
        const category = await createCategory({ name: 'Phones', slug: 'phones' })
        const response = await api.patch(`/api/admin/categories/${category._id}`).send({ name: 'Mobile' })
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 401 for invalid token', async () => {
        const category = await createCategory({ name: 'Phones', slug: 'phones' })
        const response = await api
            .patch(`/api/admin/categories/${category._id}`)
            .set('Authorization', 'Bearer invalidtoken')
            .send({ name: 'Mobile' })

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token invalid or expired')
    })

    it('returns 403 for non-admin role', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)
        const category = await createCategory({ name: 'Phones', slug: 'phones' })

        const response = await api
            .patch(`/api/admin/categories/${category._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Mobile' })

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error).toBe('forbidden')
    })

    it('returns 400 on validation error (empty body)', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)
        const category = await createCategory({ name: 'Phones', slug: 'phones' })

        const response = await api
            .patch(`/api/admin/categories/${category._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({})

        logIfServerError(response)
        expect(response.status).toBe(400)
    })

    it('returns 400 when sending unknown fields', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)
        const category = await createCategory({ name: 'Phones', slug: 'phones' })

        const response = await api
            .patch(`/api/admin/categories/${category._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ isDeleted: true })

        logIfServerError(response)
        expect(response.status).toBe(400)
    })

    it('returns 400 for invalid category id', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .patch('/api/admin/categories/invalid-id')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Mobile' })

        logIfServerError(response)
        expect(response.status).toBe(400)
        expect(response.body.error).toBe('malformatted id')
    })

    it('returns 404 when category not found', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .patch('/api/admin/categories/64b8f3a7f3a2c2a7f3a2c2a7')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Mobile' })

        logIfServerError(response)
        expect(response.status).toBe(404)
        expect(response.body.message).toBe('category not found')
    })

    it('updates name and slug', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)
        const category = await createCategory({ name: 'Phones', slug: 'phones' })

        const response = await api
            .patch(`/api/admin/categories/${category._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Mobile Phones' })

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.name).toBe('Mobile Phones')
        expect(response.body.slug).toBe('mobile-phones')
    })
})
