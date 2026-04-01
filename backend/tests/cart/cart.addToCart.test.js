const mongooseLib = require('mongoose')
const {
    api,
    waitForDb,
    createProduct,
    createUser,
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

describe('POST /api/cart', () => {
    it('returns 401 when no token', async () => {
        const response = await api.post('/api/cart').send({ productId: 'x', quantity: 1 })
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 403 for admin role', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .post('/api/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({ productId: new mongooseLib.Types.ObjectId().toString(), quantity: 1 })

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error || response.body.message).toBe('forbidden')
    })

    it('returns 400 on validation error (missing productId)', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .post('/api/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({ quantity: 1 })

        logIfServerError(response)
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Validation error')
    })

    it('returns 404 when product not found', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)
        const fakeId = new mongooseLib.Types.ObjectId().toString()

        const response = await api
            .post('/api/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({ productId: fakeId, quantity: 1 })

        logIfServerError(response)
        expect(response.status).toBe(404)
        expect(response.body.message).toBe('product not found')
    })

    it('returns 409 when not enough stock', async () => {
        const { product } = await createProduct({ stock: 1 })
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .post('/api/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({ productId: product._id.toString(), quantity: 2 })

        logIfServerError(response)
        expect(response.status).toBe(409)
        expect(response.body.message).toBe('not enough stock')
    })

    it('adds product to cart successfully', async () => {
        const { product } = await createProduct({ stock: 5 })
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .post('/api/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({ productId: product._id.toString(), quantity: 2 })

        logIfServerError(response)
        expect(response.status).toBe(201)
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body.length).toBe(1)
        expect(response.body[0].quantity).toBe(2)
        expect(response.body[0].product).toBe(product._id.toString())
    })

    it('increments quantity when adding same product again', async () => {
        const { product } = await createProduct({ stock: 10 })
        const { user } = await createUser()
        const token = getAuthToken(user)

        await api
            .post('/api/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({ productId: product._id.toString(), quantity: 3 })

        const response = await api
            .post('/api/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({ productId: product._id.toString(), quantity: 2 })

        logIfServerError(response)
        expect(response.status).toBe(201)
        expect(response.body.length).toBe(1)
        expect(response.body[0].quantity).toBe(5)
    })
})
