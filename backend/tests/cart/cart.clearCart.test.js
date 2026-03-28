const { api, waitForDb, clearCartData, createProduct, createUser, getAuthToken, logIfServerError, mongoose } = require('../helper')

jest.setTimeout(60000)

beforeAll(async () => {
    await waitForDb(60000)
})

beforeEach(async () => {
    await clearCartData()
})

afterAll(async () => {
    await mongoose.connection.close()
})

describe('DELETE /api/cart', () => {
    it('returns 401 when no token', async () => {
        const response = await api.delete('/api/cart')
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 403 for admin role', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .delete('/api/cart')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error || response.body.message).toBe('forbidden')
    })

    it('clears cart and returns empty array', async () => {
        const { product } = await createProduct()
        const { user } = await createUser()
        user.cart.push({ product: product._id, quantity: 2 })
        await user.save()
        const token = getAuthToken(user)

        const response = await api
            .delete('/api/cart')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body.length).toBe(0)
    })
})
