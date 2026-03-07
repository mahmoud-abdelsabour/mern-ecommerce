const jwt = require('jsonwebtoken')
const config = require('../config/config')
const User = require('../../models/user.model')

const auth = async (request, response, next) => {
    const authHeader = request.get('authorization')
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.replace('Bearer ', '')
        : null

    if (!token) {
        return response.status(401).json({ error: 'token missing' })
    }

    try {
        const decodedToken = jwt.verify(token, config.JWT_SECRET)
        if (!decodedToken.id ) {
            return response.status(401).json({ error: 'token invalid' })
        }

        const user = await User.findById(decodedToken.id)

        if (!user || user.tokenVersion !== decodedToken.tokenVersion) {
            return response.status(401).json({ error: 'user not found or token invalid' })
        }

        request.user = user

        next()
    } catch (error) {
        return response.status(401).json({ error: 'token invalid or expired' })
    }
}

module.exports = {
    auth
}
