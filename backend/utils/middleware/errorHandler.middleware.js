const logger = require('./logger.middleware')

const errorHandler = (error, request, response, _next) => {
    logger.error(error.stack || error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
        const field = Object.keys(error.keyPattern || {})[0] || 'field'
        return response.status(409).json({ error: `${field} already exists` })
    }

    const status = error.statusCode || 500
    return response.status(status).json({
        message: error.message || 'Server Error',
    })
}

module.exports = errorHandler
