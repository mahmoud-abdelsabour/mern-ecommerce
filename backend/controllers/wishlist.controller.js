const wishlistService = require('../services/wishlist.service')

const addToWishlist = async (request, response) => {
  const { productId } = request.body
  const user = request.user

  const wishlist = await wishlistService.addToWishlist({ productId, user })
  return response.status(200).json(wishlist)
}

const removeFromWishlist = async (request, response) => {
  const { productId } = request.params
  const user = request.user

  const wishlist = await wishlistService.removeFromWishlist({ productId, user })
  return response.status(200).json(wishlist)
}

const getWishlist = async (request, response) => {
  const user = request.user
  const wishlist = await wishlistService.getWishlist({ user })
  return response.status(200).json(wishlist)
}

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist
}
