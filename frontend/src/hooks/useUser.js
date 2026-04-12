import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import usersApi from "../APIs/users.api"
import { getToken } from "../APIs/http"
import { getStoredUser, setStoredUser } from "../utils/authStorage"
import { notify } from "../utils/notify"

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
  const { onSuccess, onError, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (fields) => usersApi.updateProfile(fields),
    onSuccess: async (data, variables, context) => {
      queryClient.setQueryData(["me"], data)

      const existing = getStoredUser()
      if (existing?.token) {
        setStoredUser({
          ...existing,
          firstName: data?.firstName ?? existing?.firstName,
          lastName: data?.lastName ?? existing?.lastName,
          username: data?.username ?? existing?.username,
          email: data?.email ?? existing?.email,
          phone: data?.phone ?? existing?.phone,
          profilePhoto: data?.profilePhoto ?? existing?.profilePhoto,
        })
      }

      await queryClient.invalidateQueries({ queryKey: ["me"] })
      onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      notify.error("Profile could not be saved", error)
      onError?.(error, variables, context)
    },
  })
}

export const useCreateAddress = (options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess, onError, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (address) => usersApi.createAddress(address),
    onSuccess: async (data, variables, context) => {
      if (Array.isArray(data?.addresses)) {
        queryClient.setQueryData(["me"], (prev) => {
          if (!prev) return prev
          return { ...prev, addresses: data.addresses }
        })
      }
      await queryClient.invalidateQueries({ queryKey: ["me"] })
      onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      notify.error("Address could not be added", error)
      onError?.(error, variables, context)
    },
  })
}

export const useUpdateAddress = (options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess, onError, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: ({ addressId, fields }) => usersApi.updateAddress(addressId, fields),
    onSuccess: async (data, variables, context) => {
      if (Array.isArray(data?.addresses)) {
        queryClient.setQueryData(["me"], (prev) => {
          if (!prev) return prev
          return { ...prev, addresses: data.addresses }
        })
      }
      await queryClient.invalidateQueries({ queryKey: ["me"] })
      onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      notify.error("Address could not be updated", error)
      onError?.(error, variables, context)
    },
  })
}

export const useDeleteAddress = (options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess, onError, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (addressId) => usersApi.deleteAddress(addressId),
    onSuccess: async (data, variables, context) => {
      if (Array.isArray(data?.addresses)) {
        queryClient.setQueryData(["me"], (prev) => {
          if (!prev) return prev
          return { ...prev, addresses: data.addresses }
        })
      }
      await queryClient.invalidateQueries({ queryKey: ["me"] })
      onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      notify.error("Address could not be removed", error)
      onError?.(error, variables, context)
    },
  })
}

export const useDeleteMe = (options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess, onError, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: () => usersApi.deleteMe(),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: ["me"] })
      onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      notify.error("Account could not be deleted", error)
      onError?.(error, variables, context)
    },
  })
}
