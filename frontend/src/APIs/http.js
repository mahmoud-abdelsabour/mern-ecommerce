const getToken = () => {
  try {
    const raw = localStorage.getItem("user")
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.token ?? null
  } catch {
    return null
  }
}

const getAuthConfig = () => {
  const token = getToken()
  if (!token) return {}
  return { headers: { Authorization: `Bearer ${token}` } }
}

export { getToken, getAuthConfig }

