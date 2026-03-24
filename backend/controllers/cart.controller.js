const cartService = require('../services/cart.service')

const addToCart = async (request, response) => {
  const { productId, quantity } = request.body
  const user = request.user

  const cart = await cartService.addToCart({ productId, quantity, user })
  return response.status(201).json(cart)
}

const removeFromCart = async (request, response) => {
  const { productId } = request.params
  const user = request.user

  const cart = await cartService.removeFromCart({ productId, user })
  return response.status(200).json(cart)
}

const decrementCartItem = async (request, response) => {
  const { productId } = request.params
  const { amount } = request.body
  const user = request.user

  const cart = await cartService.decrementCartItem({ productId, user, amount })
  return response.status(200).json(cart)
}

const getCart = async (request, response) => {
  const user = request.user
  const cart = await cartService.getCart({ user })
  return response.status(200).json(cart)
}

const clearCart = async (request, response) => {
  const user = request.user
  const cart = await cartService.clearCart({ user })
  return response.status(200).json(cart)
}

module.exports = {
  addToCart,
  removeFromCart,
  decrementCartItem,
  getCart,
  clearCart
}
