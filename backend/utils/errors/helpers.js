const {
    AppError,
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
} = require('./AppError')

const errorFactory = (message, statusCode) => {
    if (statusCode === 404) return new NotFoundError(message)
    if (statusCode === 400) return new BadRequestError(message)
    if (statusCode === 401) return new UnauthorizedError(message)
    if (statusCode === 403) return new ForbiddenError(message)
    if (statusCode === 409) return new ConflictError(message)
    return new AppError(message, statusCode)
}

const toAppError = (error) => {
    if (error instanceof AppError) return error
    if (error.statusCode) {
        return errorFactory(error.message, error.statusCode)
    }
    return new AppError(error.message || 'Unknown error', 500)
}

module.exports = {
    errorFactory,
    toAppError,
}