const { api, waitForDb, clearProducts, createProduct, mongoose, createUser, logIfServerError, getAuthToken } = require('../helper')
const User = require('../../models/user.model')

jest.setTimeout(60000)

beforeAll(async () => {
    await waitForDb(60000)
})

beforeEach(async () => {
    await clearProducts()
    await User.deleteMany({})
})

afterAll(async () => {
    await mongoose.connection.close()
})

describe('GET /api/products/:productId/user-status', () => {
    it('returns 401 when no token', async () => {
        const { product } = await createProduct()

        const response = await api.get(`/api/products/${product._id}/user-status`)
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns false status when product not in cart/wishlist', async () => {
        const { product } = await createProduct()
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .get(`/api/products/${product._id}/user-status`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.inCart).toBe(false)
        expect(response.body.cartQuantity).toBe(0)
        expect(response.body.inWishlist).toBe(false)
    })

    it('returns true when product is in wishlist', async () => {
        const { product } = await createProduct()
        const { user } = await createUser()
        user.wishlist.push(product._id)
        await user.save()
        const token = getAuthToken(user)

        const response = await api
            .get(`/api/products/${product._id}/user-status`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.inWishlist).toBe(true)
        expect(response.body.inCart).toBe(false)
        expect(response.body.cartQuantity).toBe(0)
    })

    it('returns cart status with quantity when product is in cart', async () => {
        const { product } = await createProduct()
        const { user } = await createUser()
        user.cart.push({ product: product._id, quantity: 3 })
        await user.save()
        const token = getAuthToken(user)

        const response = await api
            .get(`/api/products/${product._id}/user-status`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.inCart).toBe(true)
        expect(response.body.cartQuantity).toBe(3)
        expect(response.body.inWishlist).toBe(false)
    })

    it('returns 401 for invalid token', async () => {
        const { product } = await createProduct()

        const response = await api
            .get(`/api/products/${product._id}/user-status`)
            .set('Authorization', 'Bearer invalidtoken')

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token invalid or expired')
    })
})
