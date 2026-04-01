const {
    api,
    waitForDb,
    createProduct,
    createUser,
    logIfServerError,
    getAuthToken,
    closeDb,
    dropDatabase,
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

describe('GET /api/cart', () => {
    it('returns 401 when no token', async () => {
        const response = await api.get('/api/cart')
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 401 for invalid token', async () => {
        const response = await api.get('/api/cart').set('Authorization', 'Bearer invalidtoken')

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token invalid or expired')
    })

    it('returns 403 for admin role', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api.get('/api/cart').set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error || response.body.message).toBe('forbidden')
    })

    it('returns empty cart for new user', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api.get('/api/cart').set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body.length).toBe(0)
    })

    it('returns populated cart items with product data', async () => {
        const { product } = await createProduct()
        const { user } = await createUser()

        user.cart.push({ product: product._id, quantity: 2 })
        await user.save()

        const token = getAuthToken(user)
        const response = await api.get('/api/cart').set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body.length).toBe(1)
        expect(response.body[0].quantity).toBe(2)
        expect(response.body[0].product).toBeDefined()
        expect(response.body[0].product._id || response.body[0].product.id).toBeDefined()
        expect(response.body[0].product.name).toBeDefined()
    })
})
