const {
    api,
    waitForDb,
    createUser,
    createProduct,
    seedOrder,
    getAuthToken,
    logIfServerError,
    dropDatabase,
    closeDb,
} = require('../../helper')
const Order = require('../../../models/order.model')

beforeAll(async () => {
    await waitForDb()
})

beforeEach(async () => {
    await dropDatabase()
})

afterAll(async () => {
    await closeDb()
})

describe('GET /api/admin/orders', () => {
    it('returns 401 when no token', async () => {
        const response = await api.get('/api/admin/orders')
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 401 for invalid token', async () => {
        const response = await api
            .get('/api/admin/orders')
            .set('Authorization', 'Bearer invalidtoken')

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token invalid or expired')
    })

    it('returns 403 for non-admin role', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api.get('/api/admin/orders').set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error).toBe('forbidden')
    })

    it('returns orders with pagination metadata', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const token = getAuthToken(admin)

        const { user } = await createUser()
        const { product } = await createProduct()
        await seedOrder({ user, product, status: 'pending' })
        await seedOrder({ user, product, status: 'shipped' })
        await seedOrder({ user, product, status: 'delivered' })

        const response = await api
            .get('/api/admin/orders?page=2&limit=2')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.orders.length).toBe(1)
        expect(response.body.pagination.totalOrders).toBe(3)
        expect(response.body.pagination.totalPages).toBe(2)
        expect(response.body.pagination.currentPage).toBe(2)
    })

    it('filters by deliveryStatus', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const token = getAuthToken(admin)

        const { user } = await createUser()
        const { product } = await createProduct()
        await seedOrder({ user, product, status: 'pending' })
        await seedOrder({ user, product, status: 'delivered' })

        const response = await api
            .get('/api/admin/orders?deliveryStatus=delivered')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.orders.length).toBe(1)
        expect(response.body.orders[0].deliveryStatus).toBe('delivered')
    })

    it('filters by userId', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const token = getAuthToken(admin)

        const { user: userA } = await createUser()
        const { user: userB } = await createUser()
        const { product } = await createProduct()

        await seedOrder({ user: userA, product, status: 'pending' })
        await seedOrder({ user: userB, product, status: 'pending' })

        const response = await api
            .get(`/api/admin/orders?userId=${userA._id}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.orders.length).toBe(1)
        const stored = await Order.findById(response.body.orders[0]._id)
        expect(String(stored.userId)).toBe(String(userA._id))
    })

    it('filters by minTotal and maxTotal', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const token = getAuthToken(admin)

        const { user } = await createUser()
        const { product: p1 } = await createProduct({ price: 50 })
        const { product: p2 } = await createProduct({ price: 200 })

        await seedOrder({ user, product: p1, status: 'pending' })
        await seedOrder({ user, product: p2, status: 'pending' })

        const response = await api
            .get('/api/admin/orders?minTotal=100&maxTotal=250')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.orders.length).toBe(1)
        expect(response.body.orders[0].totalPrice).toBe(200)
    })

    it('sorts by totalPrice asc when sort is provided', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const token = getAuthToken(admin)

        const { user } = await createUser()
        const { product: p1 } = await createProduct({ price: 50 })
        const { product: p2 } = await createProduct({ price: 200 })

        await seedOrder({ user, product: p2, status: 'pending' })
        await seedOrder({ user, product: p1, status: 'pending' })

        const response = await api
            .get('/api/admin/orders?sort={\"totalPrice\":1}')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.orders.length).toBe(2)
        expect(response.body.orders[0].totalPrice).toBe(50)
        expect(response.body.orders[1].totalPrice).toBe(200)
    })

    it('returns minimal fields (card view)', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const token = getAuthToken(admin)

        const { user } = await createUser()
        const { product } = await createProduct({ photos: ['https://example.com/p.jpg'] })

        await seedOrder({ user, product, status: 'pending' })

        const response = await api.get('/api/admin/orders').set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)

        const order = response.body.orders[0]
        expect(order.createdAt).toBeTruthy()
        expect(order.deliveryStatus).toBeTruthy()
        expect(order.totalPrice).toBeTruthy()
        expect(order.firstPhoto).toBeTruthy()
    })

    it('filters by date range', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const token = getAuthToken(admin)

        const { user } = await createUser()
        const { product } = await createProduct()

        const orderOld = await seedOrder({ user, product, status: 'pending' })
        const orderNew = await seedOrder({ user, product, status: 'pending' })

        await Order.collection.updateOne(
            { _id: orderOld._id },
            { $set: { createdAt: new Date('2020-01-01') } }
        )
        await Order.collection.updateOne(
            { _id: orderNew._id },
            { $set: { createdAt: new Date('2024-01-01') } }
        )

        const response = await api
            .get('/api/admin/orders?startDate=2023-01-01&endDate=2024-12-31')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.orders.length).toBe(1)
        expect(String(response.body.orders[0]._id)).toBe(String(orderNew._id))
    })
})
