const Order = require('../../../models/order.model')
const requireOwnership = require('./ownership.middleware')

module.exports = requireOwnership(async (req) => {
  const order = await Order.findById(req.params.orderId).select('userId')
  return order?.userId
})
