const wishlistController = require('../controllers/wishlist.controller')
const { asyncWrapper, auth, role } = require('../utils/middleware/index')
const express = require('express')
//api/wishlist
const router = express.Router()

// get wishlist
router.get(
    '/',
    auth,
    role('user'),
    asyncWrapper(wishlistController.getWishlist)
)

// add to wishlist
router.post(
    '/products/:productId',
    auth,
    role('user'),
    asyncWrapper(wishlistController.addToWishlist)
)

// delete from wishlist
router.delete(
    '/products/:productId',
    auth,
    role('user'),
    asyncWrapper(wishlistController.removeFromWishlist)
)

// clear wishlist
router.delete(
    '/',
    auth,
    role('user'),
    asyncWrapper(wishlistController.clearWishlist)
)

module.exports = router