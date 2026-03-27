const { api, mongoose, waitForDb } = require('../generalHelper')
const User = require('../../models/user.model')
const { hashingValue } = require('../../utils/auth/password.util')
const { createToken } = require('../../utils/auth/token.util')

const clearUsers = async () => {
    await User.deleteMany({})
}

const buildUserPayload = (overrides = {}) => ({
    firstName: 'Test',
    lastName: 'User',
    username: `user_${Date.now()}`,
    email: `user_${Date.now()}@example.com`,
    password: 'Aa1@aaaa',
    phone: `010${Math.floor(10000000 + Math.random() * 90000000)}`,
    ...overrides
})

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

const getAuthToken = (user) => {
    return createToken(user)
}

module.exports = {
    api,
    mongoose,
    waitForDb,
    clearUsers,
    buildUserPayload,
    createUser,
    getAuthToken
}
