const cartController = require('../controllers/cart.controller')
const { asyncWrapper, auth, validate, role } = require('../utils/middleware/index')
const cartValidator = require('../validators/cart.validator')
const express = require('express')
//api/cart
const router = express.Router()

// get cart
router.get(
    '/',
    auth,
    role('user'),
    asyncWrapper(cartController.getCart)
)

// add to cart
router.post(
    '/',
    auth,
    role('user'),
    validate(cartValidator.addToCartSchema),
    asyncWrapper(cartController.addToCart)
)

// decrement from cart item
router.patch(
    '/products/:productId',
    auth,
    role('user'),
    validate(cartValidator.decrementCartItemSchema),
    asyncWrapper(cartController.decrementCartItem)
)

// delete from cart
router.delete(
    '/products/:productId',
    auth,
    role('user'),
    asyncWrapper(cartController.removeFromCart)
)

// clear cart
router.delete(
    '/',
    auth,
    role('user'),
    asyncWrapper(cartController.clearCart)
)



module.exports = router