const {
    api,
    waitForDb,
    createUser,
    createProduct,
    getAuthToken,
    logIfServerError,
    dropDatabase,
    closeDb,
} = require('../../helper')
const Product = require('../../../models/product.model')

beforeAll(async () => {
    await waitForDb()
})

beforeEach(async () => {
    await dropDatabase()
})

afterAll(async () => {
    await closeDb()
})

describe('GET /api/admin/products/:productId', () => {
    it('returns 401 when no token', async () => {
        const { product } = await createProduct()
        const response = await api.get(`/api/admin/products/${product._id}`)
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 401 for invalid token', async () => {
        const { product } = await createProduct()

        const response = await api
            .get(`/api/admin/products/${product._id}`)
            .set('Authorization', 'Bearer invalidtoken')

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token invalid or expired')
    })

    it('returns 403 for non-admin role', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)
        const { product } = await createProduct()

        const response = await api
            .get(`/api/admin/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error).toBe('forbidden')
    })

    it('returns 400 for invalid product id', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .get('/api/admin/products/invalid-id')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(400)
        expect(response.body.error).toBe('malformatted id')
    })

    it('returns 404 when product not found', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .get('/api/admin/products/64b8f3a7f3a2c2a7f3a2c2a7')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(404)
        expect(response.body.message).toBe('product not found')
    })

    it('returns product', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)
        const { product } = await createProduct()

        const response = await api
            .get(`/api/admin/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.product.id).toBe(product._id.toString())
    })

    it('returns deleted product for admin', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)
        const { product } = await createProduct()

        await Product.findByIdAndUpdate(product._id, { $set: { isDeleted: true } })

        const response = await api
            .get(`/api/admin/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.product.id).toBe(product._id.toString())
    })
})
