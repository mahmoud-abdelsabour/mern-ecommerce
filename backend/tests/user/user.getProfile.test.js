const { api, waitForDb, createUser, getAuthToken, logIfServerError, mongoose, clearUsers } = require('../helper')

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

describe('GET /api/users/me', () => {
    it('returns 401 when no token', async () => {
        const response = await api.get('/api/users/me')
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 401 for invalid token', async () => {
        const response = await api
            .get('/api/users/me')
            .set('Authorization', 'Bearer invalidtoken')

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token invalid or expired')
    })

    it('returns the user profile for valid token (user role)', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .get('/api/users/me')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.id).toBe(user._id.toString())
        expect(response.body.email).toBe(user.email)
        expect(response.body.username).toBe(user.username)
        expect(response.body.passwordHash).toBeUndefined()
    })

    it('returns the user profile for valid token (admin role)', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .get('/api/users/me')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.id).toBe(user._id.toString())
        expect(response.body.role).toBe('admin')
        expect(response.body.passwordHash).toBeUndefined()
    })
})
