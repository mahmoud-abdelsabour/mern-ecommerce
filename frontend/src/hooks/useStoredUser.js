import { useSyncExternalStore } from "react"
import { getStoredUser, onAuthChanged } from "../utils/authStorage"

export const useStoredUser = () => {
  return useSyncExternalStore(onAuthChanged, getStoredUser, getStoredUser)
}

