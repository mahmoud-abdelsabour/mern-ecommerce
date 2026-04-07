import axios from "axios"

const baseURL = "/api/brands"

const getBrands = async () => {
  const response = await axios.get(baseURL)
  return response.data
}

export default {
  getBrands,
}

