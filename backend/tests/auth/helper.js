const { api, mongoose, waitForDb, buildUserPayload, createUser, getAuthToken } = require('../generalHelper')
const User = require('../../models/user.model')

const clearUsers = async () => {
    await User.deleteMany({})
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
