const { api, waitForDb, clearProducts, createProduct } = require('./helper')
const { mongoose, createUser, logIfServerError } = require('../generalHelper')
const Review = require('../../models/review.model')
const User = require('../../models/user.model')
const mongooseLib = require('mongoose')

jest.setTimeout(60000)

beforeAll(async () => {
    await waitForDb(60000)
})

beforeEach(async () => {
    await clearProducts()
    await Review.deleteMany({})
    await User.deleteMany({})
})

afterAll(async () => {
    await mongoose.connection.close()
})

const createReviewsForProduct = async (productId, count) => {
    const users = await Promise.all(
        Array.from({ length: count }, () => createUser())
    )

    return Review.create(
        users.map((u, idx) => ({
            user: u.user._id,
            product: productId,
            rating: 5,
            comment: `Review ${idx}`,
            name: `User ${idx}`
        }))
    )
}

describe('GET /api/products/:productId/reviews', () => {
    it('returns empty reviews list for product with no reviews', async () => {
        const { product } = await createProduct()

        const response = await api.get(`/api/products/${product._id}/reviews`)
        logIfServerError(response)

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body.reviews)).toBe(true)
        expect(response.body.reviews.length).toBe(0)
        expect(response.body.pagination.total).toBe(0)
    })

    it('returns paginated reviews', async () => {
        const { product } = await createProduct()
        await createReviewsForProduct(product._id, 6)

        const response = await api.get(`/api/products/${product._id}/reviews?page=1&limit=2`)
        logIfServerError(response)

        expect(response.status).toBe(200)
        expect(response.body.reviews.length).toBe(2)
        expect(response.body.pagination.total).toBe(6)
        expect(response.body.pagination.totalPages).toBe(3)
    })

    it('returns second page correctly', async () => {
        const { product } = await createProduct()
        await createReviewsForProduct(product._id, 5)

        const response = await api.get(`/api/products/${product._id}/reviews?page=2&limit=2`)
        logIfServerError(response)

        expect(response.status).toBe(200)
        expect(response.body.reviews.length).toBe(2)
        expect(response.body.pagination.page).toBe(2)
    })

    it('returns empty list for non-existing product id', async () => {
        const id = new mongooseLib.Types.ObjectId().toString()
        const response = await api.get(`/api/products/${id}/reviews`)
        logIfServerError(response)

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body.reviews)).toBe(true)
        expect(response.body.reviews.length).toBe(0)
        expect(response.body.pagination.total).toBe(0)
    })

    it('returns 400 for invalid product id', async () => {
        const response = await api.get('/api/products/bad-id/reviews')
        logIfServerError(response)

        expect(response.status).toBe(400)
        expect(response.body.error).toBe('malformatted id')
    })
})
