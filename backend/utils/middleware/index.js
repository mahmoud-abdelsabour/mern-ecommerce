const errorHandler = require('./errorHandler.middleware')
const auth = require('./auth.middleware')
const asyncWrapper = require('./asyncWrapper.middleware')
const requestLogger = require('./requestLogger.middleware')
const unknownEndpoint = require('./unknownEndpoint.middleware')
const logger = require('./logger.middleware')
const validate = require('./validate.middleware')
const role = require('./authorization/role.middleware')
const ownership = require('./authorization/ownership.middleware')
const security = require('./security.middleware')

module.exports = {
    errorHandler,
    auth,
    asyncWrapper,
    requestLogger,
    unknownEndpoint,
    logger,
    validate,
    role,
    ownership,
    security
}
