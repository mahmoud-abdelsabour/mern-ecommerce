const mongooseLib = require('mongoose')
const {
    api,
    waitForDb,
    createProduct,
    createUser,
    logIfServerError,
    closeDb,
    dropDatabase,
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

describe('GET /api/products/:productId', () => {
    it('returns product with reviews preview (<=5) and hasMoreReviews false', async () => {
        const { product } = await createProduct()

        const user1 = (await createUser()).user
        const user2 = (await createUser()).user
        const user3 = (await createUser()).user

        await Review.create([
            { user: user1._id, product: product._id, rating: 5, comment: 'Great', name: 'U1' },
            { user: user2._id, product: product._id, rating: 4, comment: 'Good', name: 'U2' },
            { user: user3._id, product: product._id, rating: 3, comment: 'Ok', name: 'U3' },
        ])

        const response = await api.get(`/api/products/${product._id}`)
        logIfServerError(response)

        expect(response.status).toBe(200)
        expect(response.body.product).toBeDefined()
        expect(response.body.product.id).toBe(product._id.toString())
        expect(response.body.product.brand).toBeDefined()
        expect(response.body.product.category).toBeDefined()
        expect(response.body.product.brand.name).toBeDefined()
        expect(response.body.product.category.name).toBeDefined()
        expect(Array.isArray(response.body.reviewsPreview)).toBe(true)
        expect(response.body.reviewsPreview.length).toBe(3)
        expect(response.body.reviewsCount).toBe(3)
        expect(response.body.hasMoreReviews).toBe(false)
    })

    it('limits reviewsPreview to 5 and sets hasMoreReviews true when >5', async () => {
        const { product } = await createProduct()

        const users = await Promise.all(Array.from({ length: 6 }, () => createUser()))

        await Review.create(
            users.map((u, idx) => ({
                user: u.user._id,
                product: product._id,
                rating: 5,
                comment: `Review ${idx}`,
                name: `User ${idx}`,
            }))
        )

        const response = await api.get(`/api/products/${product._id}`)
        logIfServerError(response)

        expect(response.status).toBe(200)
        expect(response.body.reviewsPreview.length).toBe(5)
        expect(response.body.reviewsCount).toBe(6)
        expect(response.body.hasMoreReviews).toBe(true)
    })

    it('returns live review counters even when stored product.rating is stale', async () => {
        const { product } = await createProduct({ rating: { score: 4.9, voters: 187 } })

        const response = await api.get(`/api/products/${product._id}`)
        logIfServerError(response)

        expect(response.status).toBe(200)
        expect(response.body.reviewsPreview.length).toBe(0)
        expect(response.body.reviewsCount).toBe(0)
        expect(response.body.product.rating.voters).toBe(0)
        expect(response.body.product.rating.score).toBe(0)
        expect(response.body.hasMoreReviews).toBe(false)
    })

    it('returns 404 when product not found', async () => {
        const id = new mongooseLib.Types.ObjectId().toString()
        const response = await api.get(`/api/products/${id}`)
        logIfServerError(response)

        expect(response.status).toBe(404)
        expect(response.body.message).toBe('product not found')
    })

    it('returns 404 for deleted product', async () => {
        const { product } = await createProduct({ isDeleted: true })
        const response = await api.get(`/api/products/${product._id}`)
        logIfServerError(response)

        expect(response.status).toBe(404)
        expect(response.body.message).toBe('product not found')
    })

    it('returns 400 for invalid product id', async () => {
        const response = await api.get('/api/products/bad-id')
        logIfServerError(response)

        expect(response.status).toBe(400)
        expect(response.body.error).toBe('malformatted id')
    })
})
