const {
    api,
    waitForDb,
    createProduct,
    createUser,
    getAuthToken,
    logIfServerError,
    closeDb,
    dropDatabase,
    seedOrder,
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

describe('PATCH /api/orders/:orderId/cancel', () => {
    it('returns 401 when no token', async () => {
        const response = await api.patch('/api/orders/123/cancel')
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 403 for admin role', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .patch('/api/orders/123/cancel')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error || response.body.message).toBe('forbidden')
    })

    it('returns 403 when cancelling another user�s order', async () => {
        const { user: userA } = await createUser()
        const { user: userB } = await createUser()
        const { product } = await createProduct()
        const order = await seedOrder({ user: userB, product })

        const token = getAuthToken(userA)
        const response = await api
            .patch(`/api/orders/${order._id}/cancel`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error).toBe('forbidden')
    })

    it('returns 409 when order not pending', async () => {
        const { user } = await createUser()
        const { product } = await createProduct()
        const order = await seedOrder({ user, product, status: 'shipped' })

        const token = getAuthToken(user)
        const response = await api
            .patch(`/api/orders/${order._id}/cancel`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(409)
        expect(response.body.message).toBe('order is not pending or not found')
    })

    it('cancels pending order', async () => {
        const { user } = await createUser()
        const { product } = await createProduct()
        const order = await seedOrder({ user, product, status: 'pending' })

        const token = getAuthToken(user)
        const response = await api
            .patch(`/api/orders/${order._id}/cancel`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.order.deliveryStatus).toBe('cancelled')
        expect(response.body.message).toBe('Order cancelled')
    })
})
