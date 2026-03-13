const express = require("express")
const {security} = require("./utils/middleware/index")
const orderRoutes = require("./routes/order.route")
const productRoutes = require("./routes/product.route")

const app = express()

security(app)
app.use('/api/orders', orderRoutes)
app.use('/api/products', productRoutes)

app.use(express.json())