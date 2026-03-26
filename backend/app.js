const express = require("express")
const {security} = require("./utils/middleware/index")
const orderRoutes = require("./routes/order.route")
const authRoutes = require("./routes/auth.route")
const productRoutes = require("./routes/product.route")
const userRoutes = require("./routes/user.route")
const cartRoutes = require("./routes/cart.route")
const wishlistRoutes = require("./routes/wishlist.route")
const reviewRoutes = require("./routes/review.route")
const { requestLogger, unknownEndpoint, errorHandler } = require('./utils/middleware/index')
const { userAdminRoutes,
        brandAdminRoutes,
        categoryAdminRoutes,
        orderAdminRoutes,
        productAdminRoutes } = require('./routes/admin/admin.index.route')

const app = express()

app.use(express.json())
security(app)
app.use(requestLogger)

// User Routes
app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/products', productRoutes)
app.use('/api/users', userRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/reviews', reviewRoutes)

// Admin Routes
app.use('api/admin/users', userAdminRoutes)
app.use('api/admin/brands', brandAdminRoutes)
app.use('api/admin/categories', categoryAdminRoutes)
app.use('api/admin/orders', orderAdminRoutes)
app.use('api/admin/products', productAdminRoutes)

app.use(unknownEndpoint)
app.use(errorHandler)

module.exports = app