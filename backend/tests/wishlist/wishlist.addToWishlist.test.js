const {
    api,
    waitForDb,
    createUser,
    createProduct,
    getAuthToken,
    logIfServerError,
    closeDb,
    dropDatabase
} = require('../helper')

beforeAll(async () => {
    await waitForDb()
})

beforeEach(async () => {
    await dropDatabase()
})

afterAll(async () => {
    await closeDb()
})

describe('POST /api/wishlist/products/:productId', () => {
    it('returns 401 when no token', async () => {
        const { product } = await createProduct()

        const response = await api.post(`/api/wishlist/products/${product._id}`)
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 401 for invalid token', async () => {
        const { product } = await createProduct()

        const response = await api
            .post(`/api/wishlist/products/${product._id}`)
            .set('Authorization', 'Bearer invalidtoken')

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token invalid or expired')
    })

    it('returns 403 for admin role', async () => {
        const { product } = await createProduct()
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .post(`/api/wishlist/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error).toBe('forbidden')
    })

    it('returns 400 for invalid product id', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .post('/api/wishlist/products/invalid-id')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(400)
        expect(response.body.error).toBe('malformatted id')
    })

    it('returns 404 when product not found', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .post('/api/wishlist/products/64b8f3a7f3a2c2a7f3a2c2a7')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(404)
        expect(response.body.message).toBe('product not found')
    })

    it('adds product to wishlist', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)
        const { product } = await createProduct()

        const response = await api
            .post(`/api/wishlist/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body.length).toBe(1)
        expect(String(response.body[0])).toBe(String(product._id))
    })

    it('returns 409 when product already in wishlist', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)
        const { product } = await createProduct()

        user.wishlist = [product._id]
        await user.save()

        const response = await api
            .post(`/api/wishlist/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(409)
        expect(response.body.message).toBe('product already exists')
    })
})

