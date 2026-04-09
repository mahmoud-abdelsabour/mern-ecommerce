import { useMutation } from "@tanstack/react-query"
import authApi from "../APIs/auth.api"

// Auth-related React Query hooks live here so pages stay focused on UI.
export const useRegister = (options = {}) => {
  return useMutation({
    mutationFn: (payload) => authApi.register(payload),
    ...options,
  })
}

export const useLogin = (options = {}) => {
  return useMutation({
    mutationFn: (payload) => authApi.login(payload),
    ...options,
  })
}
