import { Navigate, Outlet, useLocation } from "react-router-dom"
import { getToken } from "../APIs/http"

const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  const isLoggedIn = Boolean(getToken())

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children ?? <Outlet />
}

export default ProtectedRoute