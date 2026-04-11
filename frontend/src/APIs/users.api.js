import axios from "axios"
import { getAuthConfig } from "./http"

const baseURL = "/api/users"

const getMe = async () => {
  const response = await axios.get(`${baseURL}/me`, getAuthConfig())
  return response.data
}

const updateProfile = async (fields) => {
  const response = await axios.patch(`${baseURL}/me/update-profile`, fields, getAuthConfig())
  return response.data
}

const createAddress = async (address) => {
  const response = await axios.post(`${baseURL}/me/create-address`, address, getAuthConfig())
  return response.data
}

const updateAddress = async (addressId, fields) => {
  const response = await axios.patch(
    `${baseURL}/me/addresses/${addressId}`,
    fields,
    getAuthConfig()
  )
  return response.data
}

const deleteAddress = async (addressId) => {
  const response = await axios.delete(`${baseURL}/me/addresses/${addressId}`, getAuthConfig())
  return response.data
}

const deleteMe = async () => {
  const response = await axios.delete(`${baseURL}/me/delete`, getAuthConfig())
  return response.data
}

export default {
  getMe,
  updateProfile,
  createAddress,
  updateAddress,
  deleteAddress,
  deleteMe,
}
