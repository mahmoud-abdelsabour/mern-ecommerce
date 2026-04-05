import axios from "axios"
import { getAuthConfig } from "../apis/http"

const baseURL = "/api/products"

const getProducts = async (query = {}) => {
  const response = await axios.get(baseURL, { params: query })
  return response.data
}

const getProductById = async (productId) => {
  const response = await axios.get(`${baseURL}/${productId}`)
  return response.data
}

const getProductReviews = async (productId, query = {}) => {
  const response = await axios.get(`${baseURL}/${productId}/reviews`, { params: query })
  return response.data
}

const createReview = async (productId, { rating, comment } = {}) => {
  const response = await axios.post(
    `${baseURL}/${productId}/reviews`,
    { rating, comment },
    getAuthConfig()
  )
  return response.data
}

const getProductUserStatus = async (productId) => {
  const response = await axios.get(`${baseURL}/${productId}/user-status`, getAuthConfig())
  return response.data
}

export default {
  getProducts,
  getProductById,
  getProductReviews,
  createReview,
  getProductUserStatus,
}
