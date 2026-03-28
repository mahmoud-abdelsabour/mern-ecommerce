const { api, waitForDb, clearUsers, buildUserPayload } = require('../helper')
const mongoose = require('mongoose')
const User = require('../../models/user.model')
const { hashingValue } = require('../../utils/auth/password.util')

jest.setTimeout(20000)

beforeAll(async () => {
    await waitForDb()
})

beforeEach(async () => {
    await clearUsers()
})

afterAll(async () => {
    await mongoose.connection.close()
})

describe('POST /api/auth/login', () => {
    it('logs in with valid credentials', async () => {
        const payload = buildUserPayload()
        const passwordHash = await hashingValue(payload.password, 10)

        await new User({
            firstName: payload.firstName,
            lastName: payload.lastName,
            username: payload.username,
            email: payload.email,
            phone: payload.phone,
            passwordHash
        }).save()

        const response = await api
            .post('/api/auth/login')
            .send({ email: payload.email, password: payload.password })
            .expect(200)

        expect(response.body).toHaveProperty('token')
        expect(response.body.username).toBe(payload.username)
        expect(response.body.firstName).toBe(payload.firstName)
        expect(response.body.lastName).toBe(payload.lastName)
    })

    it('rejects invalid email format', async () => {
        const response = await api
            .post('/api/auth/login')
            .send({ email: 'bad-email', password: 'Aa1@aaaa' })
            .expect(400)

        expect(response.body.message).toBe('Validation error')
        expect(Array.isArray(response.body.errors)).toBe(true)
    })

    it('rejects invalid password format', async () => {
        const response = await api
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'password' })
            .expect(400)

        expect(response.body.message).toBe('Validation error')
    })

    it('rejects non-existent user', async () => {
        const response = await api
            .post('/api/auth/login')
            .send({ email: 'nope@example.com', password: 'Aa1@aaaa' })
            .expect(401)

        expect(response.body.message || response.body.error).toBeDefined()
    })

    it('rejects wrong password', async () => {
        const payload = buildUserPayload()
        const passwordHash = await hashingValue(payload.password, 10)

        await new User({
            firstName: payload.firstName,
            lastName: payload.lastName,
            username: payload.username,
            email: payload.email,
            phone: payload.phone,
            passwordHash
        }).save()

        const response = await api
            .post('/api/auth/login')
            .send({ email: payload.email, password: 'Aa1@bbbb' })
            .expect(401)

        expect(response.body.message || response.body.error).toBeDefined()
    })

    it('rejects deleted user', async () => {
        const payload = buildUserPayload()
        const passwordHash = await hashingValue(payload.password, 10)

        await new User({
            firstName: payload.firstName,
            lastName: payload.lastName,
            username: payload.username,
            email: payload.email,
            phone: payload.phone,
            passwordHash,
            isDeleted: true
        }).save()

        const response = await api
            .post('/api/auth/login')
            .send({ email: payload.email, password: payload.password })
            .expect(403)

        expect(response.body.message || response.body.error).toBeDefined()
    })
})
