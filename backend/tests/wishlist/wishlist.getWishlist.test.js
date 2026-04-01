const {
    api,
    waitForDb,
    createUser,
    createProduct,
    getAuthToken,
    logIfServerError,
    dropDatabase,
    closeDb,
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

describe('GET /api/wishlist', () => {
    it('returns 401 when no token', async () => {
        const response = await api.get('/api/wishlist')
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 401 for invalid token', async () => {
        const response = await api.get('/api/wishlist').set('Authorization', 'Bearer invalidtoken')

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token invalid or expired')
    })

    it('returns 403 for admin role', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api.get('/api/wishlist').set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error).toBe('forbidden')
    })

    it('returns empty wishlist for new user', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api.get('/api/wishlist').set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body.length).toBe(0)
    })

    it('returns wishlist items for user', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)
        const { product } = await createProduct()

        user.wishlist = [product._id]
        await user.save()

        const response = await api.get('/api/wishlist').set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body.length).toBe(1)
        expect(String(response.body[0])).toBe(String(product._id))
    })
})
