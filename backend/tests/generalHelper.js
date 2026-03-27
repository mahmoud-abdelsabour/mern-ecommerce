const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../app')
const User = require('../models/user.model')
const { hashingValue } = require('../utils/auth/password.util')

const api = request(app)

const waitForDb = (timeoutMs = 20000) => {
    if (mongoose.connection.readyState === 1) return Promise.resolve()
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('MongoDB connection timeout')), timeoutMs)
        mongoose.connection.once('open', () => {
            clearTimeout(timer)
            resolve()
        })
        mongoose.connection.once('error', (err) => {
            clearTimeout(timer)
            reject(err)
        })
    })
}

const buildUserPayload = (overrides = {}) => {
    const unique = `${Date.now()}_${Math.floor(Math.random() * 1e9)}`
    return {
    firstName: 'Test',
    lastName: 'User',
    username: `user_${unique}`,
    email: `user_${unique}@example.com`,
    password: 'Aa1@aaaa',
    phone: `010${Math.floor(10000000 + Math.random() * 90000000)}`,
    ...overrides
    }
}

const createUser = async (overrides = {}) => {
    const payload = buildUserPayload(overrides)
    const passwordHash = await hashingValue(payload.password, 10)

    const user = await new User({
        firstName: payload.firstName,
        lastName: payload.lastName,
        username: payload.username,
        email: payload.email,
        phone: payload.phone,
        passwordHash
    }).save()

    return { user, payload }
}

const logIfServerError = (response) => {
    if (response.status >= 500) {
        // eslint-disable-next-line no-console
        console.log('Server error response:', response.body)
        if (response.body && response.body.stack) {
            // eslint-disable-next-line no-console
            console.log('Server error stack:', response.body.stack)
        }
    }
}

module.exports = {
    api,
    mongoose,
    waitForDb,
    buildUserPayload,
    createUser,
    logIfServerError
}
