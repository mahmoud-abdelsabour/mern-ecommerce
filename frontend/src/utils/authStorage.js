const USER_KEY = "user"
// Custom event used to notify the app when we update auth state (login/logout)
// without relying on React state or forcing a full reload.
const AUTH_CHANGED_EVENT = "auth:changed"

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const getStoredUser = () => {
  // Centralized read to keep the "shape" of stored auth consistent everywhere.
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  return safeJsonParse(raw)
}

const setStoredUser = (user) => {
  // Persist current user + token and notify any listeners (e.g. auto-logout timer).
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

const clearStoredUser = () => {
  // Remove auth state and notify listeners so UI can react immediately.
  localStorage.removeItem(USER_KEY)
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

const onAuthChanged = (callback) => {
  // Subscribe to auth changes within the same tab...
  const handler = () => callback()
  const storageHandler = (e) => {
    // ...and across tabs (storage event only fires in other tabs/windows).
    if (e.key === USER_KEY) callback()
  }
  window.addEventListener(AUTH_CHANGED_EVENT, handler)
  window.addEventListener("storage", storageHandler)
  return () => {
    window.removeEventListener(AUTH_CHANGED_EVENT, handler)
    window.removeEventListener("storage", storageHandler)
  }
}

export { getStoredUser, setStoredUser, clearStoredUser, onAuthChanged }
