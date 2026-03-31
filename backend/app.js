const express = require("express")
const mongoose = require('mongoose')
const config = require('./utils/config/config')
const {security} = require("./utils/middleware/index")
const orderRoutes = require("./routes/order.route")
const authRoutes = require("./routes/auth.route")
const productRoutes = require("./routes/product.route")
const userRoutes = require("./routes/user.route")
const cartRoutes = require("./routes/cart.route")
const wishlistRoutes = require("./routes/wishlist.route")
const reviewRoutes = require("./routes/review.route")
const { requestLogger, unknownEndpoint, errorHandler, logger } = require('./utils/middleware/index')
const { userAdminRoutes,
        brandAdminRoutes,
        categoryAdminRoutes,
        orderAdminRoutes,
        productAdminRoutes } = require('./routes/admin/admin.index.route')

const app = express()

if (process.env.NODE_ENV !== 'test') {
    logger.info('connecting to MongoDB')

    mongoose.connect(config.MONGODB_URI, { family: 4 })
            .then(() => {
                logger.info('connected to MongoDB Successfully')
            })
            .catch(error => {
                logger.error('error connecting to MongoDB:', error.message)
            })
}

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
app.use('/api/admin/users', userAdminRoutes)
app.use('/api/admin/brands', brandAdminRoutes)
app.use('/api/admin/categories', categoryAdminRoutes)
app.use('/api/admin/orders', orderAdminRoutes)
app.use('/api/admin/products', productAdminRoutes)

app.use(unknownEndpoint)
app.use(errorHandler)

module.exports = app
