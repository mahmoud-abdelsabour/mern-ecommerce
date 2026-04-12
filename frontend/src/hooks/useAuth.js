import { useMutation } from "@tanstack/react-query"
import authApi from "../APIs/auth.api"
import { notify } from "../utils/notify"

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

export const useUpdatePassword = (options = {}) => {
  const { onError, ...rest } = options
  return useMutation({
    ...rest,
    mutationFn: (payload) => authApi.updatePassword(payload),
    onError: (error, variables, context) => {
      notify.error("Password could not be updated", error)
      onError?.(error, variables, context)
    },
  })
}
