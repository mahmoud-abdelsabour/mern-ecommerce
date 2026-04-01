const {
    api,
    waitForDb,
    createUser,
    createBrand,
    getAuthToken,
    logIfServerError,
    dropDatabase,
    closeDb,
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

describe('POST /api/admin/brands', () => {
    it('returns 401 when no token', async () => {
        const response = await api.post('/api/admin/brands').send({ name: 'Apple' })
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 401 for invalid token', async () => {
        const response = await api
            .post('/api/admin/brands')
            .set('Authorization', 'Bearer invalidtoken')
            .send({ name: 'Apple' })

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token invalid or expired')
    })

    it('returns 403 for non-admin role', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .post('/api/admin/brands')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Apple' })

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error).toBe('forbidden')
    })

    it('returns 400 on validation error (missing name)', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .post('/api/admin/brands')
            .set('Authorization', `Bearer ${token}`)
            .send({ logo: 'https://example.com/logo.png' })

        logIfServerError(response)
        expect(response.status).toBe(400)
    })

    it('returns 400 on invalid logo url', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .post('/api/admin/brands')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Apple', logo: 'not-a-url' })

        logIfServerError(response)
        expect(response.status).toBe(400)
    })

    it('creates brand with valid data', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .post('/api/admin/brands')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Apple', logo: 'https://example.com/logo.png' })

        logIfServerError(response)
        expect(response.status).toBe(201)
        expect(response.body.name).toBe('Apple')
        expect(response.body.slug).toBe('apple')
    })

    it('returns 409 for duplicate brand name', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        await createBrand({ name: 'Apple', slug: 'apple' })

        const response = await api
            .post('/api/admin/brands')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Apple' })

        logIfServerError(response)
        expect(response.status).toBe(409)
        expect(response.body.error).toBe('name already exists')
    })
})
