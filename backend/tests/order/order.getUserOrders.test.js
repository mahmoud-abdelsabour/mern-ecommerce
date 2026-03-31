const { api, waitForDb, createProduct, createUser, getAuthToken, logIfServerError, closeDb, dropDatabase , seedOrder } = require('../helper')
const Order = require('../../models/order.model')

beforeAll(async () => {
    await waitForDb()
})

beforeEach(async () => {
    await dropDatabase()
})

afterAll(async () => {
    await closeDb()
})

describe('GET /api/orders', () => {
    it('returns 401 when no token', async () => {
        const response = await api.get('/api/orders')
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 403 for admin role', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .get('/api/orders')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error || response.body.message).toBe('forbidden')
    })

    it('returns empty list for new user', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .get('/api/orders')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(Array.isArray(response.body.orders)).toBe(true)
        expect(response.body.orders.length).toBe(0)
        expect(response.body.pagination.totalOrders).toBe(0)
    })

    it('returns only orders of the authenticated user', async () => {
        const { user: userA } = await createUser()
        const { user: userB } = await createUser()
        const { product } = await createProduct()

        await seedOrder({ user: userA, product })
        await seedOrder({ user: userB, product })

        const token = getAuthToken(userA)
        const response = await api
            .get('/api/orders')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.orders.length).toBe(1)
    })

    it('paginates results', async () => {
        const { user } = await createUser()
        const { product } = await createProduct()

        await seedOrder({ user, product })
        await seedOrder({ user, product })
        await seedOrder({ user, product })

        const token = getAuthToken(user)
        const response = await api
            .get('/api/orders?page=1&limit=2')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.orders.length).toBe(2)
        expect(response.body.pagination.totalOrders).toBe(3)
    })
})

