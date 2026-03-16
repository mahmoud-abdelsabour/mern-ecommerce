const cartController = require('../controllers/cart.controller')
const { asyncWrapper, auth, validate } = require('../utils/middleware/index')
const cartValidator = require('../validators/cart.validator')
const express = require('express')

const router = express.Router()

router.get(
    '/cart',
    auth,
    asyncWrapper(cartController.getCart)
)

router.post(
    '/cart',
    auth,
    validate(cartValidator.addToCartSchema),
    asyncWrapper(cartController.addToCart)
)

router.patch(
    '/cart/product/:productId',
    auth,
    validate(cartValidator.decrementCartItemSchema),
    asyncWrapper(cartController.decrementCartItem)
)

router.delete(
    '/cart/product/:productId',
    auth,
    asyncWrapper(cartController.removeFromCart)
)



module.exports = router