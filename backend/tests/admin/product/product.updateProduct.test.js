const {
    api,
    waitForDb,
    createUser,
    createProduct,
    getAuthToken,
    logIfServerError,
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

describe('PATCH /api/admin/products/:productId', () => {
    it('returns 401 when no token', async () => {
        const { product } = await createProduct()
        const response = await api.patch(`/api/admin/products/${product._id}`).send({ name: 'Updated' })
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 401 for invalid token', async () => {
        const { product } = await createProduct()

        const response = await api
            .patch(`/api/admin/products/${product._id}`)
            .set('Authorization', 'Bearer invalidtoken')
            .send({ name: 'Updated' })

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token invalid or expired')
    })

    it('returns 403 for non-admin role', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)
        const { product } = await createProduct()

        const response = await api
            .patch(`/api/admin/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Updated' })

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error).toBe('forbidden')
    })

    it('returns 400 on validation error (empty body)', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)
        const { product } = await createProduct()

        const response = await api
            .patch(`/api/admin/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({})

        logIfServerError(response)
        expect(response.status).toBe(400)
    })

    it('returns 400 when sending unknown fields', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)
        const { product } = await createProduct()

        const response = await api
            .patch(`/api/admin/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ isDeleted: true })

        logIfServerError(response)
        expect(response.status).toBe(400)
    })

    it('returns 400 for invalid product id', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .patch('/api/admin/products/invalid-id')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Updated' })

        logIfServerError(response)
        expect(response.status).toBe(400)
        expect(response.body.error).toBe('malformatted id')
    })

    it('returns 404 when product not found', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .patch('/api/admin/products/64b8f3a7f3a2c2a7f3a2c2a7')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Updated' })

        logIfServerError(response)
        expect(response.status).toBe(404)
        expect(response.body.message).toBe('product not found')
    })

    it('updates name and stock', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)
        const { product } = await createProduct()

        const response = await api
            .patch(`/api/admin/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Updated', stock: 0 })

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.name).toBe('Updated')
        expect(response.body.stock).toBe(0)
    })

    it('returns 404 when brand not found', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)
        const { product } = await createProduct()

        const response = await api
            .patch(`/api/admin/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ brand: '64b8f3a7f3a2c2a7f3a2c2a7' })

        logIfServerError(response)
        expect(response.status).toBe(404)
        expect(response.body.message).toBe('brand not found')
    })

    it('returns 404 when category not found', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)
        const { product } = await createProduct()

        const response = await api
            .patch(`/api/admin/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ category: '64b8f3a7f3a2c2a7f3a2c2a7' })

        logIfServerError(response)
        expect(response.status).toBe(404)
        expect(response.body.message).toBe('category not found')
    })
})
