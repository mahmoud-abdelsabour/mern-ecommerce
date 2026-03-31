const {
    api,
    waitForDb,
    createUser,
    createProduct,
    seedOrder,
    getAuthToken,
    logIfServerError,
    dropDatabase,
    closeDb
} = require('../../helper')

beforeAll(async () => {
    await waitForDb()
})

beforeEach(async () => {
    await dropDatabase()
})

afterAll(async () => {
    await closeDb()
})

describe('GET /api/admin/orders/users/:userId', () => {
    it('returns 401 when no token', async () => {
        const response = await api.get('/api/admin/orders/users/64b8f3a7f3a2c2a7f3a2c2a7')
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 401 for invalid token', async () => {
        const response = await api
            .get('/api/admin/orders/users/64b8f3a7f3a2c2a7f3a2c2a7')
            .set('Authorization', 'Bearer invalidtoken')

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token invalid or expired')
    })

    it('returns 403 for non-admin role', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .get('/api/admin/orders/users/64b8f3a7f3a2c2a7f3a2c2a7')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error).toBe('forbidden')
    })

    it('returns 400 for invalid user id', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .get('/api/admin/orders/users/invalid-id')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(400)
        expect(response.body.error).toBe('malformatted id')
    })

    it('returns empty list for user with no orders', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const token = getAuthToken(admin)

        const { user } = await createUser()

        const response = await api
            .get(`/api/admin/orders/users/${user._id}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.orders.length).toBe(0)
    })

    it('returns only orders for that user', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const token = getAuthToken(admin)

        const { user: userA } = await createUser()
        const { user: userB } = await createUser()
        const { product } = await createProduct()

        await seedOrder({ user: userA, product, status: 'pending' })
        await seedOrder({ user: userB, product, status: 'pending' })

        const response = await api
            .get(`/api/admin/orders/users/${userA._id}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.orders.length).toBe(1)
        expect(String(response.body.orders[0].userId)).toBe(String(userA._id))
    })

    it('paginates results', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const token = getAuthToken(admin)

        const { user } = await createUser()
        const { product } = await createProduct()

        await seedOrder({ user, product, status: 'pending' })
        await seedOrder({ user, product, status: 'pending' })
        await seedOrder({ user, product, status: 'pending' })

        const response = await api
            .get(`/api/admin/orders/users/${user._id}?page=2&limit=2`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.orders.length).toBe(1)
        expect(response.body.pagination.totalOrders).toBe(3)
        expect(response.body.pagination.totalPages).toBe(2)
        expect(response.body.pagination.currentPage).toBe(2)
    })
})
