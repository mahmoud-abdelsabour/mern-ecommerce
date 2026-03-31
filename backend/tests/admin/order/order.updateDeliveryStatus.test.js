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

describe('PATCH /api/admin/orders/:orderId/deliveryStatus', () => {
    it('returns 401 when no token', async () => {
        const response = await api
            .patch('/api/admin/orders/64b8f3a7f3a2c2a7f3a2c2a7/deliveryStatus')
            .send({ deliveryStatus: 'shipped' })

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 401 for invalid token', async () => {
        const response = await api
            .patch('/api/admin/orders/64b8f3a7f3a2c2a7f3a2c2a7/deliveryStatus')
            .set('Authorization', 'Bearer invalidtoken')
            .send({ deliveryStatus: 'shipped' })

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token invalid or expired')
    })

    it('returns 403 for non-admin role', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .patch('/api/admin/orders/64b8f3a7f3a2c2a7f3a2c2a7/deliveryStatus')
            .set('Authorization', `Bearer ${token}`)
            .send({ deliveryStatus: 'shipped' })

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error).toBe('forbidden')
    })

    it('returns 400 on validation error (missing deliveryStatus)', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .patch('/api/admin/orders/64b8f3a7f3a2c2a7f3a2c2a7/deliveryStatus')
            .set('Authorization', `Bearer ${token}`)
            .send({})

        logIfServerError(response)
        expect(response.status).toBe(400)
    })

    it('returns 400 on invalid deliveryStatus value', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .patch('/api/admin/orders/64b8f3a7f3a2c2a7f3a2c2a7/deliveryStatus')
            .set('Authorization', `Bearer ${token}`)
            .send({ deliveryStatus: 'pending' })

        logIfServerError(response)
        expect(response.status).toBe(400)
    })

    it('returns 400 for invalid order id', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .patch('/api/admin/orders/invalid-id/deliveryStatus')
            .set('Authorization', `Bearer ${token}`)
            .send({ deliveryStatus: 'shipped' })

        logIfServerError(response)
        expect(response.status).toBe(400)
        expect(response.body.error).toBe('malformatted id')
    })

    it('returns 404 when order not found', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .patch('/api/admin/orders/64b8f3a7f3a2c2a7f3a2c2a7/deliveryStatus')
            .set('Authorization', `Bearer ${token}`)
            .send({ deliveryStatus: 'shipped' })

        logIfServerError(response)
        expect(response.status).toBe(404)
        expect(response.body.message).toBe('order not found')
    })

    it('returns 409 for invalid transition (pending -> delivered)', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const token = getAuthToken(admin)

        const { user } = await createUser()
        const { product } = await createProduct()

        const order = await seedOrder({ user, product, status: 'pending' })

        const response = await api
            .patch(`/api/admin/orders/${order._id}/deliveryStatus`)
            .set('Authorization', `Bearer ${token}`)
            .send({ deliveryStatus: 'delivered' })

        logIfServerError(response)
        expect(response.status).toBe(409)
        expect(response.body.message).toMatch('invalid status transition')
    })

    it('updates pending -> shipped', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const token = getAuthToken(admin)

        const { user } = await createUser()
        const { product } = await createProduct()

        const order = await seedOrder({ user, product, status: 'pending' })

        const response = await api
            .patch(`/api/admin/orders/${order._id}/deliveryStatus`)
            .set('Authorization', `Bearer ${token}`)
            .send({ deliveryStatus: 'shipped' })

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.deliveryStatus).toBe('shipped')
        expect(response.body.shippedAt).toBeTruthy()
    })

    it('updates shipped -> delivered', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const token = getAuthToken(admin)

        const { user } = await createUser()
        const { product } = await createProduct()

        const order = await seedOrder({ user, product, status: 'shipped' })

        const response = await api
            .patch(`/api/admin/orders/${order._id}/deliveryStatus`)
            .set('Authorization', `Bearer ${token}`)
            .send({ deliveryStatus: 'delivered' })

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.deliveryStatus).toBe('delivered')
        expect(response.body.deliveredAt).toBeTruthy()
    })

    it('updates return requested -> returned', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const token = getAuthToken(admin)

        const { user } = await createUser()
        const { product } = await createProduct()

        const order = await seedOrder({ user, product, status: 'return requested' })

        const response = await api
            .patch(`/api/admin/orders/${order._id}/deliveryStatus`)
            .set('Authorization', `Bearer ${token}`)
            .send({ deliveryStatus: 'returned' })

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.deliveryStatus).toBe('returned')
    })
})
