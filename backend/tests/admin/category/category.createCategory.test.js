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

describe('POST /api/admin/categories', () => {
    it('returns 401 when no token', async () => {
        const response = await api.post('/api/admin/categories').send({ name: 'Phones' })
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 401 for invalid token', async () => {
        const response = await api
            .post('/api/admin/categories')
            .set('Authorization', 'Bearer invalidtoken')
            .send({ name: 'Phones' })

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token invalid or expired')
    })

    it('returns 403 for non-admin role', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .post('/api/admin/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Phones' })

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error).toBe('forbidden')
    })

    it('returns 400 on validation error (missing name)', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .post('/api/admin/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({})

        logIfServerError(response)
        expect(response.status).toBe(400)
    })

    it('creates category with valid data', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .post('/api/admin/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Phones' })

        logIfServerError(response)
        expect(response.status).toBe(201)
        expect(response.body.name).toBe('Phones')
        expect(response.body.slug).toBe('phones')
    })

    it('returns 409 for duplicate category name', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        await createCategory({ name: 'Phones', slug: 'phones' })

        const response = await api
            .post('/api/admin/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Phones' })

        logIfServerError(response)
        expect(response.status).toBe(409)
        expect(response.body.error).toBe('name already exists')
    })
})
