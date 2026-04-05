import axios from "axios"
import { getAuthConfig } from "./http"

const baseURL = "/api/orders"

const createOrder = async ({ products, shippingInfo }) => {
  const response = await axios.post(baseURL, { products, shippingInfo }, getAuthConfig())
  return response.data
}

const getOrders = async (query = {}) => {
  const response = await axios.get(baseURL, { ...getAuthConfig(), params: query })
  return response.data
}

const getOrderById = async (orderId) => {
  const response = await axios.get(`${baseURL}/${orderId}`, getAuthConfig())
  return response.data
}

const cancelOrder = async (orderId) => {
  const response = await axios.patch(`${baseURL}/${orderId}/cancel`, null, getAuthConfig())
  return response.data
}

const requestReturn = async (orderId, { returnedItems }) => {
  const response = await axios.post(
    `${baseURL}/${orderId}/return`,
    { returnedItems },
    getAuthConfig()
  )
  return response.data
}

export default {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  requestReturn,
}

