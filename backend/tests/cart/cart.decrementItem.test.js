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

describe('PATCH /api/cart/products/:productId', () => {
    it('returns 401 when no token', async () => {
        const response = await api
            .patch(`/api/cart/products/${new mongooseLib.Types.ObjectId().toString()}`)
            .send({ amount: 1 })

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 403 for admin role', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .patch(`/api/cart/products/${new mongooseLib.Types.ObjectId().toString()}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ amount: 1 })

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error || response.body.message).toBe('forbidden')
    })

    it('returns 400 on validation error (missing amount)', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .patch(`/api/cart/products/${new mongooseLib.Types.ObjectId().toString()}`)
            .set('Authorization', `Bearer ${token}`)
            .send({})

        logIfServerError(response)
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Validation error')
    })

    it('returns 404 when product not in cart', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .patch(`/api/cart/products/${new mongooseLib.Types.ObjectId().toString()}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ amount: 1 })

        logIfServerError(response)
        expect(response.status).toBe(404)
        expect(response.body.message).toBe('product not in cart')
    })

    it('decrements quantity when item exists', async () => {
        const { product } = await createProduct()
        const { user } = await createUser()
        user.cart.push({ product: product._id, quantity: 3 })
        await user.save()
        const token = getAuthToken(user)

        const response = await api
            .patch(`/api/cart/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ amount: 1 })

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.length).toBe(1)
        expect(response.body[0].quantity).toBe(2)
    })

    it('removes item when quantity goes to zero', async () => {
        const { product } = await createProduct()
        const { user } = await createUser()
        user.cart.push({ product: product._id, quantity: 1 })
        await user.save()
        const token = getAuthToken(user)

        const response = await api
            .patch(`/api/cart/products/${product._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ amount: 1 })

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.length).toBe(0)
    })
})
