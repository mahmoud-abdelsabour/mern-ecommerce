const {
    api,
    waitForDb,
    createUser,
    createBrand,
    createProduct,
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

describe('GET /api/admin/brands/:brandId', () => {
    it('returns 401 when no token', async () => {
        const brand = await createBrand({ name: 'Apple', slug: 'apple' })
        const response = await api.get(`/api/admin/brands/${brand._id}`)
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 401 for invalid token', async () => {
        const brand = await createBrand({ name: 'Apple', slug: 'apple' })

        const response = await api
            .get(`/api/admin/brands/${brand._id}`)
            .set('Authorization', 'Bearer invalidtoken')

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token invalid or expired')
    })

    it('returns 403 for non-admin role', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)
        const brand = await createBrand({ name: 'Apple', slug: 'apple' })

        const response = await api
            .get(`/api/admin/brands/${brand._id}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error).toBe('forbidden')
    })

    it('returns 400 for invalid brand id', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .get('/api/admin/brands/invalid-id')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(400)
        expect(response.body.error).toBe('malformatted id')
    })

    it('returns 404 when brand not found', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .get('/api/admin/brands/64b8f3a7f3a2c2a7f3a2c2a7')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(404)
        expect(response.body.message).toBe('brand not found')
    })

    it('returns brand with productsCount', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const brand = await createBrand({ name: 'Apple', slug: 'apple' })
        await createProduct({ brand })

        const response = await api
            .get(`/api/admin/brands/${brand._id}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.name).toBe('Apple')
        expect(response.body.productsCount).toBe(1)
    })
})
