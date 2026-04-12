import axios from "axios"
import { getAuthConfig } from "./http"

const baseURL = "/api/reviews"

const updateReview = async (reviewId, { rating, comment } = {}) => {
  const response = await axios.patch(
    `${baseURL}/${reviewId}`,
    { rating, comment },
    getAuthConfig()
  )
  return response.data
}

const deleteReview = async (reviewId) => {
  const response = await axios.delete(`${baseURL}/${reviewId}`, getAuthConfig())
  return response.data
}

export default {
  updateReview,
  deleteReview,
}
