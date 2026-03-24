const wishlistController = require('../controllers/wishlist.controller')
const { asyncWrapper, auth } = require('../utils/middleware/index')
const express = require('express')

const router = express.Router()

router.get(
    '/',
    auth,
    asyncWrapper(wishlistController.getWishlist)
)

router.post(
    '/:productId',
    auth,
    asyncWrapper(wishlistController.addToWishlist)
)

router.delete(
    '/:productId',
    auth,
    asyncWrapper(wishlistController.removeFromWishlist)
)

module.exports = router