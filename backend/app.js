const express = require("express")
const securityMiddleware = require("./utils/middleware/security.middleware")

const app = express()

securityMiddleware(app)

app.use(express.json())