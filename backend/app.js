const express = require("express")
const {security} = require("./utils/middleware/index")
const orderRoutes = require("./routes/order.route")
const productRoutes = require("./routes/product.route")
const userRoutes = require("./routes/user.route")
const cartRoutes = require("./routes/cart.route")
const wishlistRoutes = require("./routes/wishlist.route")
const reviewRoutes = require("./routes/review.route")
const { requestLogger, unknownEndpoint, errorHandler } = require('./utils/middleware/index')

const app = express()

app.use(express.json())
security(app)
app.use(requestLogger)

app.use('/api/orders', orderRoutes)
app.use('/api/products', productRoutes)
app.use('/api/users', userRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/reviews', reviewRoutes)

app.use(unknownEndpoint)
app.use(errorHandler)

module.exports = app