const mongooseLib = require('mongoose')
const {
    api,
    waitForDb,
    createProduct,
    createUser,
    getAuthToken,
    logIfServerError,
    closeDb,
    dropDatabase,
    createReview,
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

describe('PATCH /api/reviews/:reviewId', () => {
    it('returns 401 when no token', async () => {
        const response = await api
            .patch(`/api/reviews/${new mongooseLib.Types.ObjectId().toString()}`)
            .send({ rating: 5 })

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 403 for admin role', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .patch(`/api/reviews/${new mongooseLib.Types.ObjectId().toString()}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ rating: 5 })

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error || response.body.message).toBe('forbidden')
    })

    it('returns 404 when review not found', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .patch(`/api/reviews/${new mongooseLib.Types.ObjectId().toString()}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ rating: 5 })

        logIfServerError(response)
        expect(response.status).toBe(404)
        expect(response.body.error).toBe('resource not found')
    })

    it('returns 403 when updating another user�s review', async () => {
        const { user: userA } = await createUser()
        const { user: userB } = await createUser()
        const { product } = await createProduct()
        const review = await createReview({ user: userB, product })

        const token = getAuthToken(userA)
        const response = await api
            .patch(`/api/reviews/${review._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ rating: 2 })

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error).toBe('forbidden')
    })

    it('returns 400 on validation error (empty body)', async () => {
        const { user } = await createUser()
        const { product } = await createProduct()
        const review = await createReview({ user, product })
        const token = getAuthToken(user)

        const response = await api
            .patch(`/api/reviews/${review._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({})

        logIfServerError(response)
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Validation error')
    })

    it('updates rating and comment', async () => {
        const { user } = await createUser()
        const { product } = await createProduct()
        const review = await createReview({ user, product })
        const token = getAuthToken(user)

        const response = await api
            .patch(`/api/reviews/${review._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ rating: 5, comment: 'Updated' })

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.rating).toBe(5)
        expect(response.body.comment).toBe('Updated')
    })
})
