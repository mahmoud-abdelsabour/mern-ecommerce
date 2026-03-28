const { api, waitForDb, createUser, getAuthToken, logIfServerError, mongoose, clearUsers, buildAddress } = require('../helper')
const mongooseLib = require('mongoose')

jest.setTimeout(60000)

beforeAll(async () => {
    await waitForDb(60000)
})

beforeEach(async () => {
    await clearUsers()
})

afterAll(async () => {
    await mongoose.connection.close()
})

describe('PATCH /api/users/me/addresses/:addressId', () => {
    it('returns 401 when no token', async () => {
        const response = await api
            .patch(`/api/users/me/addresses/${new mongooseLib.Types.ObjectId().toString()}`)
            .send({ city: 'Giza' })

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 401 for invalid token', async () => {
        const response = await api
            .patch(`/api/users/me/addresses/${new mongooseLib.Types.ObjectId().toString()}`)
            .set('Authorization', 'Bearer invalidtoken')
            .send({ city: 'Giza' })

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token invalid or expired')
    })

    it('returns 400 on validation error (empty body)', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .patch(`/api/users/me/addresses/${new mongooseLib.Types.ObjectId().toString()}`)
            .set('Authorization', `Bearer ${token}`)
            .send({})

        logIfServerError(response)
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Validation error')
    })

    it('returns 400 on unknown fields', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .patch(`/api/users/me/addresses/${new mongooseLib.Types.ObjectId().toString()}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ unknownField: 'x' })

        logIfServerError(response)
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Validation error')
    })

    it('returns 404 when address not found', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .patch(`/api/users/me/addresses/${new mongooseLib.Types.ObjectId().toString()}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ city: 'Giza' })

        logIfServerError(response)
        expect(response.status).toBe(404)
        expect(response.body.message).toBe('user not found')
    })

    it('updates address fields successfully', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        user.addresses.push(buildAddress())
        await user.save()

        const addressId = user.addresses[0]._id.toString()

        const response = await api
            .patch(`/api/users/me/addresses/${addressId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ city: 'Giza', floor: 5 })

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.message).toBe('Address updated successfully')
        expect(Array.isArray(response.body.addresses)).toBe(true)
        const updated = response.body.addresses.find(a => String(a._id) === String(addressId))
        expect(updated.city).toBe('Giza')
        expect(updated.floor).toBe(5)
    })
})
