import { getStoredUser } from "../utils/authStorage"

const getToken = () => {
  // Read token from our centralized auth storage helper.
  const user = getStoredUser()
  return user?.token ?? null
}

const getAuthConfig = () => {
  const token = getToken()
  if (!token) return {}
  return { headers: { Authorization: `Bearer ${token}` } }
}

export { getToken, getAuthConfig }
