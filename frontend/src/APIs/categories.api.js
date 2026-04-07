import axios from "axios"

const baseURL = "/api/categories"

const getCategories = async () => {
  const response = await axios.get(baseURL)
  return response.data
}

export default {
  getCategories,
}

