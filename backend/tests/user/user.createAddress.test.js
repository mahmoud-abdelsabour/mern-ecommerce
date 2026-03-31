const { api, waitForDb, createUser, getAuthToken, logIfServerError,  closeDb,dropDatabase, buildAddress } = require('../helper')

beforeAll(async () => {
    await waitForDb()
})

beforeEach(async () => {
    await dropDatabase()
})

afterAll(async () => {
    await closeDb()
})

describe('POST /api/users/me/create-address', () => {
    it('returns 401 when no token', async () => {
        const response = await api.post('/api/users/me/create-address').send(buildAddress())
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 400 on validation error', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .post('/api/users/me/create-address')
            .set('Authorization', `Bearer ${token}`)
            .send({})

        logIfServerError(response)
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Validation error')
    })

    it('creates address successfully', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .post('/api/users/me/create-address')
            .set('Authorization', `Bearer ${token}`)
            .send(buildAddress())

        logIfServerError(response)
        expect(response.status).toBe(201)
        expect(response.body.message).toBe('Address added successfully')
        expect(Array.isArray(response.body.addresses)).toBe(true)
        expect(response.body.addresses.length).toBe(1)
        expect(response.body.addresses[0].city).toBe('Cairo')
    })
})

