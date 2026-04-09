import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import usersApi from "../APIs/users.api"
import { getToken } from "../APIs/http"

// User/profile hooks (server state via React Query).

export const useMe = (options = {}) => {
  const enabled = Boolean(getToken())

  return useQuery({
    queryKey: ["me"],
    queryFn: () => usersApi.getMe(),
    enabled,
    staleTime: 1000 * 30,
    ...options,
  })
}

export const useUpdateProfile = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fields) => usersApi.updateProfile(fields),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: ["me"] })
      options.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useCreateAddress = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (address) => usersApi.createAddress(address),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: ["me"] })
      options.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useUpdateAddress = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ addressId, fields }) => usersApi.updateAddress(addressId, fields),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: ["me"] })
      options.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useDeleteMe = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => usersApi.deleteMe(),
    onSuccess: async (data, variables, context) => {
      // User is gone; clear caches and let callers decide navigation.
      await queryClient.invalidateQueries({ queryKey: ["me"] })
      options.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}
