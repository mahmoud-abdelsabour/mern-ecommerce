const base64UrlToBase64 = (value) => {
  // JWT uses base64url (RFC 7515): "-" and "_" instead of "+" and "/",
  // and without the standard "=" padding.
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/")
  const padLength = (4 - (normalized.length % 4)) % 4
  return normalized + "=".repeat(padLength)
}

const decodeJwtPayload = (token) => {
  // Returns the decoded JWT payload object, or null if token is invalid.
  if (!token || typeof token !== "string") return null
  const parts = token.split(".")
  if (parts.length < 2) return null

  try {
    // `atob` expects standard base64, so we normalize from base64url first.
    const json = atob(base64UrlToBase64(parts[1]))
    return JSON.parse(json)
  } catch {
    return null
  }
}

const getJwtExpirationMs = (token) => {
  // `exp` is a Unix timestamp in seconds.
  const payload = decodeJwtPayload(token)
  const expSeconds = payload?.exp
  if (!expSeconds || typeof expSeconds !== "number") return null
  return expSeconds * 1000
}

export { decodeJwtPayload, getJwtExpirationMs }
