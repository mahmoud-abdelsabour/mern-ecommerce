const { api, waitForDb, createProduct, createUser, getAuthToken, logIfServerError, mongoose, clearProducts, clearUsers, buildShippingInfo } = require('../helper')
const Order = require('../../models/order.model')
const Product = require('../../models/product.model')
const User = require('../../models/user.model')

jest.setTimeout(60000)

beforeAll(async () => {
    await waitForDb(60000)
})

beforeEach(async () => {
    await clearProducts()
    await clearUsers()
    await Order.deleteMany({})
})

afterAll(async () => {
    await mongoose.connection.close()
})

describe('POST /api/orders', () => {
    it('returns 401 when no token', async () => {
        const response = await api.post('/api/orders').send({})
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 403 for admin role', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({})

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error || response.body.message).toBe('forbidden')
    })

    it('returns 400 on validation error (missing products)', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({ shippingInfo: buildShippingInfo(user) })

        logIfServerError(response)
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Validation error')
    })

    it('returns 409 when not enough stock', async () => {
        const { product } = await createProduct({ stock: 1 })
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({
                products: [{ product: product._id.toString(), quantity: 2 }],
                shippingInfo: buildShippingInfo(user)
            })

        logIfServerError(response)
        expect(response.status).toBe(409)
        expect(response.body.message).toBe('not enough stock')
    })

    it('creates order, decrements stock, and clears cart', async () => {
        const { product } = await createProduct({ stock: 5 })
        const { user } = await createUser()
        user.cart.push({ product: product._id, quantity: 2 })
        await user.save()
        const token = getAuthToken(user)

        const response = await api
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({
                products: [{ product: product._id.toString(), quantity: 2 }],
                shippingInfo: buildShippingInfo(user)
            })

        logIfServerError(response)
        expect(response.status).toBe(201)
        expect(response.body.products.length).toBe(1)
        expect(response.body.totalPrice).toBe(product.price * 2)

        const updatedProduct = await Product.findById(product._id)
        expect(updatedProduct.stock).toBe(3)

        const dbUser = await User.findById(user._id)
        expect(dbUser.cart.length).toBe(0)
    })
})
