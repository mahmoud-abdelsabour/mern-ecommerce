const {
    api,
    waitForDb,
    createProduct,
    createDeliveredOrder,
    closeDb,
    dropDatabase,
    createUser,
    logIfServerError,
    getAuthToken,
} = require('../helper')
const Review = require('../../models/review.model')

beforeAll(async () => {
    await waitForDb()
})

beforeEach(async () => {
    await dropDatabase()
})

afterAll(async () => {
    await closeDb()
})

describe('POST /api/products/:productId/reviews', () => {
    it('returns 401 when no token', async () => {
        const { product } = await createProduct()
        const response = await api
            .post(`/api/products/${product._id}/reviews`)
            .send({ rating: 5, comment: 'Nice' })

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 403 when role is not user (admin)', async () => {
        const { product } = await createProduct()
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .post(`/api/products/${product._id}/reviews`)
            .set('Authorization', `Bearer ${token}`)
            .send({ rating: 5, comment: 'Nice' })

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error || response.body.message).toBe('forbidden')
    })

    it('returns 400 on validation error (missing rating)', async () => {
        const { product } = await createProduct()
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .post(`/api/products/${product._id}/reviews`)
            .set('Authorization', `Bearer ${token}`)
            .send({ comment: 'Nice' })

        logIfServerError(response)
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Validation error')
    })

    it('returns 403 when user has not purchased product', async () => {
        const { product } = await createProduct()
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .post(`/api/products/${product._id}/reviews`)
            .set('Authorization', `Bearer ${token}`)
            .send({ rating: 4, comment: 'Ok' })

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.message).toBe('only buyers can review products')
    })

    it('creates review when user has delivered order', async () => {
        const { product } = await createProduct()
        const { user } = await createUser()
        const token = getAuthToken(user)

        await createDeliveredOrder({ user, product })

        const response = await api
            .post(`/api/products/${product._id}/reviews`)
            .set('Authorization', `Bearer ${token}`)
            .send({ rating: 5, comment: 'Great' })

        logIfServerError(response)
        expect(response.status).toBe(201)
        expect(response.body.rating).toBe(5)
        expect(response.body.comment).toBe('Great')
        expect(response.body.product).toBe(product._id.toString())
    })

    it('returns 409 when user already reviewed product', async () => {
        const { product } = await createProduct()
        const { user } = await createUser()
        const token = getAuthToken(user)

        await createDeliveredOrder({ user, product })
        await Review.create({
            user: user._id,
            product: product._id,
            rating: 5,
            comment: 'First',
            name: user.firstName,
        })

        const response = await api
            .post(`/api/products/${product._id}/reviews`)
            .set('Authorization', `Bearer ${token}`)
            .send({ rating: 4, comment: 'Second' })

        logIfServerError(response)
        expect(response.status).toBe(409)
        expect(response.body.message).toBe('product already reviewed')
    })
})
