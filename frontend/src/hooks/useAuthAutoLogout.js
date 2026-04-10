import axios from "axios"
import { useEffect, useMemo, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { clearStoredUser, getStoredUser, onAuthChanged } from "../utils/authStorage"
import { getJwtExpirationMs } from "../utils/jwt"

const LOGIN_PATH = "/login"

export const useAuthAutoLogout = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // Keep the latest route in a ref so the scheduled timeout can safely check
  // whether we're already on the login page (avoids stale-closure issues).
  const locationRef = useRef(location)
  useEffect(() => {
    locationRef.current = location
  }, [location])

  const logoutAndRedirect = useMemo(() => {
    return () => {
      // Single source of truth for clearing auth.
      clearStoredUser()
      if (locationRef.current?.pathname !== LOGIN_PATH) {
        navigate(LOGIN_PATH, { replace: true })
      }
    }
  }, [navigate])

  // Auto-logout exactly when the JWT expires.
  useEffect(() => {
    let timeoutId = null

    const schedule = () => {
      // Reset the previous timer whenever auth changes (login/logout/new token).
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = null

      const user = getStoredUser()
      const token = user?.token
      if (!token) return

      const expMs = getJwtExpirationMs(token)
      const now = Date.now()

      // If token has no exp claim, fall back to 1 hour from now (matches backend default).
      const targetMs = expMs ?? now + 60 * 60 * 1000
      const remaining = targetMs - now

      if (remaining <= 0) {
        // Token is already expired (or clock skew) — log out immediately.
        logoutAndRedirect()
        return
      }

      // Schedule an exact logout at expiry time.
      timeoutId = setTimeout(() => logoutAndRedirect(), remaining)
    }

    // Schedule once on mount, then reschedule on any auth changes.
    schedule()
    const unsubscribe = onAuthChanged(schedule)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      unsubscribe()
    }
  }, [logoutAndRedirect])

  // If backend says token is invalid/expired, force logout.
  useEffect(() => {
    // A single, app-wide interceptor keeps behavior consistent for all API calls.
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status
        const url = String(error?.config?.url ?? "")

        // Don't hijack login/register failures.
        const isAuthLoginOrRegister =
          url.includes("/api/auth/login") || url.includes("/api/auth/register")

        if (status === 401 && !isAuthLoginOrRegister) {
          // Server-side auth mismatch (expired/invalid token) — clear client state.
          logoutAndRedirect()
        }

        return Promise.reject(error)
      }
    )

    return () => {
      // Prevent stacking multiple interceptors across hot reloads/unmounts.
      axios.interceptors.response.eject(interceptorId)
    }
  }, [logoutAndRedirect])
}
