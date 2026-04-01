const jwt = require('jsonwebtoken')
const config = require('../config/config')

const createToken = user => {
    const token = jwt.sign(
        {
            username: user.username,
            id: user._id,
            tokenVersion: user.tokenVersion,
            role: user.role,
        },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
    )

    return token
}

const incrementTokenVersion = user => user.tokenVersion + 1

module.exports = {
    createToken,
    incrementTokenVersion,
}
