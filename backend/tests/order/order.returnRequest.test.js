const { api, waitForDb, createProduct, createUser, getAuthToken, logIfServerError, closeDb ,dropDatabase, seedOrder, setDeliveredAt } = require('../helper')

beforeAll(async () => {
    await waitForDb()
})

beforeEach(async () => {
    await dropDatabase()
})

afterAll(async () => {
    await closeDb()
})

describe('POST /api/orders/:orderId/return', () => {
    it('returns 401 when no token', async () => {
        const response = await api.post('/api/orders/123/return')
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 403 for admin role', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .post('/api/orders/123/return')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error || response.body.message).toBe('forbidden')
    })

    it('returns 403 when requesting return for another user�s order', async () => {
        const { user: userA } = await createUser()
        const { user: userB } = await createUser()
        const { product } = await createProduct()
        const order = await seedOrder({ user: userB, product, status: 'delivered' })
        await setDeliveredAt(order, 1)

        const token = getAuthToken(userA)
        const response = await api
            .post(`/api/orders/${order._id}/return`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                returnedItems: [{ product: product._id.toString(), quantity: 1, reason: 'Damaged' }]
            })

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error).toBe('forbidden')
    })

    it('returns 400 when order not delivered', async () => {
        const { user } = await createUser()
        const { product } = await createProduct()
        const order = await seedOrder({ user, product, status: 'pending' })

        const token = getAuthToken(user)
        const response = await api
            .post(`/api/orders/${order._id}/return`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                returnedItems: [{ product: product._id.toString(), quantity: 1, reason: '' }]
            })

        logIfServerError(response)
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('order not delivered yet or already requested a return')
    })

    it('returns 400 when product not in order', async () => {
        const { user } = await createUser()
        const { product } = await createProduct()
        const { product: otherProduct } = await createProduct()
        const order = await seedOrder({ user, product, status: 'delivered' })
        await setDeliveredAt(order, 1)

        const token = getAuthToken(user)
        const response = await api
            .post(`/api/orders/${order._id}/return`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                returnedItems: [{ product: otherProduct._id.toString(), quantity: 1, reason: '' }]
            })

        logIfServerError(response)
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('product not in order')
    })

    it('returns 400 when return quantity exceeds purchased', async () => {
        const { user } = await createUser()
        const { product } = await createProduct()
        const order = await seedOrder({ user, product, status: 'delivered' })
        await setDeliveredAt(order, 1)

        const token = getAuthToken(user)
        const response = await api
            .post(`/api/orders/${order._id}/return`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                returnedItems: [{ product: product._id.toString(), quantity: 2, reason: '' }]
            })

        logIfServerError(response)
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('return quantity exceeds purchased quantity')
    })

    it('returns 400 when return window expired', async () => {
        const { user } = await createUser()
        const { product } = await createProduct()
        const order = await seedOrder({ user, product, status: 'delivered' })
        await setDeliveredAt(order, 20)

        const token = getAuthToken(user)
        const response = await api
            .post(`/api/orders/${order._id}/return`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                returnedItems: [{ product: product._id.toString(), quantity: 1, reason: '' }]
            })

        logIfServerError(response)
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('return window expired')
    })

    it('submits return request successfully', async () => {
        const { user } = await createUser()
        const { product } = await createProduct()
        const order = await seedOrder({ user, product, status: 'delivered' })
        await setDeliveredAt(order, 1)

        const token = getAuthToken(user)
        const response = await api
            .post(`/api/orders/${order._id}/return`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                returnedItems: [{ product: product._id.toString(), quantity: 1, reason: 'Damaged' }]
            })

        logIfServerError(response)
        expect(response.status).toBe(201)
        expect(response.body.order.deliveryStatus).toBe('return requested')
        expect(response.body.message).toBe('Return request submitted')
    })
})

