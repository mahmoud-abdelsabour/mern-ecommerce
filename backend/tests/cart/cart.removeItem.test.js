const mongooseLib = require('mongoose')
const {
    api,
    waitForDb,
    createProduct,
    createUser,
    getAuthToken,
    logIfServerError,
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

describe('DELETE /api/cart/products/:productId', () => {
    it('returns 401 when no token', async () => {
        const response = await api.delete(
            `/api/cart/products/${new mongooseLib.Types.ObjectId().toString()}`
        )
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 403 for admin role', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .delete(`/api/cart/products/${new mongooseLib.Types.ObjectId().toString()}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error || response.body.message).toBe('forbidden')
    })

    it('returns 404 when product not in cart', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .delete(`/api/cart/products/${new mongooseLib.Types.ObjectId().toString()}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(404)
        expect(response.body.message).toBe('product not in cart')
    })

    it('removes product from cart', async () => {
        const { product } = await createProduct()
        const { user } = await createUser()
        user.cart.push({ product: product._id, quantity: 2 })
        await user.save()
        const token = getAuthToken(user)

        const response = await api
            .delete(`/api/cart/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body.length).toBe(0)
    })
})
