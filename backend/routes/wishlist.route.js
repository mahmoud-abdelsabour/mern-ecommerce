const wishlistController = require('../controllers/wishlist.controller')
const { asyncWrapper, auth, validate } = require('../utils/middleware/index')
const wishlistValidator = require('../validators/wishlist.validator')
const express = require('express')

const router = express.Router()

router.get(
    '/',
    auth,
    asyncWrapper(wishlistController.getWishlist)
)

router.post(
    '/',
    auth,
    validate(wishlistValidator.addToWishlistSchema),
    asyncWrapper(wishlistController.addToWishlist)
)

router.delete(
    '/product/:productId',
    auth,
    asyncWrapper(wishlistController.removeFromWishlist)
)

module.exports = router