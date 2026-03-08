const errorHandler = require('./errorHandler.middleware')
const auth = require('./auth.middleware')
const asyncWrapper = require('./asyncWrapper.middleware')
const requestLogger = require('./requestLogger.middleware')
const unknownEndpoint = require('./unknownEndpoint.middleware')
const logger = require('./logger.middleware')
const validate = require('./validate.middleware')

module.exports = {
    errorHandler,
    auth,
    asyncWrapper,
    requestLogger,
    unknownEndpoint,
    logger,
    validate
}
