const { api, waitForDb, createProduct, createUser, getAuthToken, logIfServerError, closeDb,dropDatabase, seedOrder } = require('../helper')
const mongooseLib = require('mongoose')

beforeAll(async () => {
    await waitForDb()
})

beforeEach(async () => {
    await dropDatabase()
})

afterAll(async () => {
    await closeDb()
})

describe('GET /api/orders/:orderId', () => {
    it('returns 401 when no token', async () => {
        const response = await api.get(`/api/orders/${new mongooseLib.Types.ObjectId().toString()}`)
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('allows admin to access any order', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const { user } = await createUser()
        const { product } = await createProduct()
        const order = await seedOrder({ user, product })

        const token = getAuthToken(admin)
        const response = await api
            .get(`/api/orders/${order._id}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.id).toBe(order._id.toString())
    })

    it('returns 403 when user tries to access another user�s order', async () => {
        const { user: userA } = await createUser()
        const { user: userB } = await createUser()
        const { product } = await createProduct()
        const order = await seedOrder({ user: userB, product })

        const token = getAuthToken(userA)
        const response = await api
            .get(`/api/orders/${order._id}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error).toBe('forbidden')
    })

    it('returns 404 when order not found', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .get(`/api/orders/${new mongooseLib.Types.ObjectId().toString()}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(404)
        expect(response.body.error).toBe('resource not found')
    })
})

