const helmet = require("helmet")
const cors = require("cors")
const rateLimit = require("express-rate-limit")
const mongoSanitize = require("express-mongo-sanitize")
const hpp = require("hpp")

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests, please try again later."
  }
})

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5
})

const corsOptions = {
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}

const securityMiddleware = (app) => {
  app.use(helmet())
  app.use(cors(corsOptions))
  app.use("/api", limiter)
  app.use("/api/auth/login", authLimiter)
  app.use(mongoSanitize())
  app.use(hpp())
}

module.exports = securityMiddleware