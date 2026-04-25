const logger = require('./logger.middleware')
const { AppError, toAppError } = require('../errors')

const errorHandler = (error, request, response, _next) => {
    logger.error(error.stack || error.message)

    if (error instanceof AppError) {
        return response.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        })
    }

    if (error.name === 'CastError') {
        return response.status(400).json({ status: 'fail', error: 'malformatted id' })
    }
    if (error.name === 'ValidationError') {
        return response.status(400).json({ status: 'fail', error: error.message })
    }
    if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
        const field = Object.keys(error.keyPattern || {})[0] || 'field'
        return response.status(409).json({ status: 'fail', error: `${field} already exists` })
    }

    const convertedError = toAppError(error)
    return response.status(convertedError.statusCode).json({
        status: convertedError.status,
        message: convertedError.message || 'Server Error',
    })
}

    if (error.name === 'CastError') {
        return response.status(400).json({ status: 'fail', error: 'malformatted id' })
    }
    if (error.name === 'ValidationError') {
        return response.status(400).json({ status: 'fail', error: error.message })
    }
    if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
        const field = Object.keys(error.keyPattern || {})[0] || 'field'
        return response.status(409).json({ status: 'fail', error: `${field} already exists` })
    }

    const status = error.statusCode || 500
    return response.status(status).json({
        status: 'error',
        message: error.message || 'Server Error',
    })
}

module.exports = errorHandler
