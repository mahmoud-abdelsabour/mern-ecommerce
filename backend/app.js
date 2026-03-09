const express = require("express")
const {security} = require("./utils/middleware/index")

const app = express()

security(app)

app.use(express.json())