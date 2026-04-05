import axios from "axios"
import { getAuthConfig } from "./http"

const baseURL = "/api/wishlist"

const getWishlist = async () => {
  const response = await axios.get(baseURL, getAuthConfig())
  return response.data
}

const addToWishlist = async (productId) => {
  const response = await axios.post(`${baseURL}/products/${productId}`, null, getAuthConfig())
  return response.data
}

const removeFromWishlist = async (productId) => {
  const response = await axios.delete(`${baseURL}/products/${productId}`, getAuthConfig())
  return response.data
}

const clearWishlist = async () => {
  const response = await axios.delete(baseURL, getAuthConfig())
  return response.data
}

export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
}

