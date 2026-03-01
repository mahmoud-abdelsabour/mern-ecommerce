const errorHandler = require('./errorHandler.middleware')
const auth = require('./auth.middleware')
const asyncWrapper = require('./asyncWrapper.middleware')
const requestLogger = require('./requestLogger.middleware')
const unknownEndpoint = require('./unknownEndpoint.middleware')

module.exports = {
    errorHandler,
    auth,
    asyncWrapper,
    requestLogger,
    unknownEndpoint
}
