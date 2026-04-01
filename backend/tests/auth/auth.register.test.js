const {
    api,
    waitForDb,
    closeDb,
    dropDatabase,
    buildUserPayload,
    logIfServerError,
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

describe('POST /api/auth/register', () => {
    it('registers a user with valid data', async () => {
        const payload = buildUserPayload()

        const response = await api.post('/api/auth/register').send(payload)

        logIfServerError(response)

        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty('id')
        expect(response.body.email).toBe(payload.email.toLowerCase())
        expect(response.body.username).toBe(payload.username)
        expect(response.body).not.toHaveProperty('passwordHash')
    })

    it('rejects missing required fields', async () => {
        const payload = buildUserPayload({ email: undefined })

        const response = await api.post('/api/auth/register').send(payload)

        logIfServerError(response)

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Validation error')
        expect(Array.isArray(response.body.errors)).toBe(true)
    })

    it('rejects invalid password format', async () => {
        const payload = buildUserPayload({ password: 'password' })

        const response = await api.post('/api/auth/register').send(payload)

        logIfServerError(response)

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Validation error')
    })

    it('rejects invalid phone format', async () => {
        const payload = buildUserPayload({ phone: '123' })

        const response = await api.post('/api/auth/register').send(payload)

        logIfServerError(response)

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Validation error')
    })

    it('rejects duplicate email', async () => {
        const payload = buildUserPayload()

        const first = await api.post('/api/auth/register').send(payload)
        logIfServerError(first)
        expect(first.status).toBe(201)

        const response = await api
            .post('/api/auth/register')
            .send({ ...payload, username: `user_${Date.now()}` })

        logIfServerError(response)

        expect(response.status).toBe(409)
        expect(response.body.message || response.body.error).toBeDefined()
    })
})
