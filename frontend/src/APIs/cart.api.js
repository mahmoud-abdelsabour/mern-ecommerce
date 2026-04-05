import axios from "axios"
import { getAuthConfig } from "./http"

const baseURL = "/api/cart"

const getCart = async () => {
  const response = await axios.get(baseURL, getAuthConfig())
  return response.data
}

const addToCart = async ({ productId, quantity }) => {
  const response = await axios.post(baseURL, { productId, quantity }, getAuthConfig())
  return response.data
}

const decrementCartItem = async ({ productId, amount = 1 }) => {
  const response = await axios.patch(
    `${baseURL}/products/${productId}`,
    { amount },
    getAuthConfig()
  )
  return response.data
}

const removeFromCart = async (productId) => {
  const response = await axios.delete(`${baseURL}/products/${productId}`, getAuthConfig())
  return response.data
}

const clearCart = async () => {
  const response = await axios.delete(baseURL, getAuthConfig())
  return response.data
}

export default {
  getCart,
  addToCart,
  decrementCartItem,
  removeFromCart,
  clearCart,
}
