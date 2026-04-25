const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const hpp = require('hpp')

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many requests, please try again later.',
    },
})

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many login attempts, please try again later.' },
})

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { error: 'Too many accounts created, please try again later.' },
})

const corsOptions = {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
}

const securityMiddleware = app => {
    app.use(helmet())
    app.use(cors(corsOptions))
    if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'development') {
        app.use('/api', limiter)
        app.use('/api/auth/login', authLimiter)
        app.use('/api/auth/register', registerLimiter)
    }
    app.use((req, res, next) => {
        Object.defineProperty(req, 'query', {
            value: { ...req.query },
            writable: true,
            configurable: true,
            enumerable: true,
        })
        next()
    })
    app.use(mongoSanitize())
    app.use(hpp())
}

module.exports = securityMiddleware
