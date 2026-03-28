const { api, waitForDb, createProduct, createUser, getAuthToken, logIfServerError, mongoose, clearProducts, clearUsers, createReview } = require('../helper')
const Review = require('../../models/review.model')
const mongooseLib = require('mongoose')

jest.setTimeout(60000)

beforeAll(async () => {
    await waitForDb(60000)
})

beforeEach(async () => {
    await clearProducts()
    await clearUsers()
    await Review.deleteMany({})
})

afterAll(async () => {
    await mongoose.connection.close()
})

describe('DELETE /api/reviews/:reviewId', () => {
    it('returns 401 when no token', async () => {
        const response = await api.delete(`/api/reviews/${new mongooseLib.Types.ObjectId().toString()}`)
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('allows admin to delete any review', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const { user } = await createUser()
        const { product } = await createProduct()
        const review = await createReview({ user, product })
        const token = getAuthToken(admin)

        const response = await api
            .delete(`/api/reviews/${review._id}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.message).toBe('review deleted')
    })

    it('returns 403 when user tries to delete another user’s review', async () => {
        const { user: userA } = await createUser()
        const { user: userB } = await createUser()
        const { product } = await createProduct()
        const review = await createReview({ user: userB, product })

        const token = getAuthToken(userA)
        const response = await api
            .delete(`/api/reviews/${review._id}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error).toBe('forbidden')
    })

    it('returns 404 when review not found', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .delete(`/api/reviews/${new mongooseLib.Types.ObjectId().toString()}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(404)
        expect(response.body.error).toBe('resource not found')
    })

    it('deletes own review', async () => {
        const { user } = await createUser()
        const { product } = await createProduct()
        const review = await createReview({ user, product })
        const token = getAuthToken(user)

        const response = await api
            .delete(`/api/reviews/${review._id}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.message).toBe('review deleted')
    })
})
