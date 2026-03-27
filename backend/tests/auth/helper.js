const { api, mongoose, waitForDb, buildUserPayload, createUser } = require('../generalHelper')
const { createToken } = require('../../utils/auth/token.util')
const User = require('../../models/user.model')

const clearUsers = async () => {
    await User.deleteMany({})
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
