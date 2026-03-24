const cartController = require('../controllers/cart.controller')
const { asyncWrapper, auth, validate } = require('../utils/middleware/index')
const cartValidator = require('../validators/cart.validator')
const express = require('express')

const router = express.Router()

router.get(
    '/',
    auth,
    asyncWrapper(cartController.getCart)
)

router.post(
    '/',
    auth,
    validate(cartValidator.addToCartSchema),
    asyncWrapper(cartController.addToCart)
)

router.patch(
    '/:productId',
    auth,
    validate(cartValidator.decrementCartItemSchema),
    asyncWrapper(cartController.decrementCartItem)
)

router.delete(
    '/:productId',
    auth,
    asyncWrapper(cartController.removeFromCart)
)

router.delete(
    '/',
    auth,
    asyncWrapper(cartController.clearCart)
)



module.exports = router