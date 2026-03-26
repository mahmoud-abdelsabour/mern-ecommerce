const user = require('./admin.user.route')
const brand = require('./admin.brand.route')
const category = require('./admin.category.route')
const order = require('./admin.order.route')
const product = require('./admin.user.route')

module.exports = {
    user,
    brand,
    category,
    order,
    product
}