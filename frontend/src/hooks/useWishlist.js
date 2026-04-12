import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import wishlistApi from "../APIs/wishlist.api"
import { getToken } from "../APIs/http"
import { notify } from "../utils/notify"

// Wishlist hooks (server state via React Query).
// The wishlist is auth-protected, so queries are disabled when no token exists.

export const useWishlist = (options = {}) => {
  const enabled = Boolean(getToken())

  return useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistApi.getWishlist(),
    enabled,
    staleTime: 1000 * 10,
    ...options,
  })
}

export const useAddToWishlist = (options = {}) => {
  const queryClient = useQueryClient()
  const { onError: userOnError, onSuccess: userOnSuccess, onSettled: userOnSettled, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (productId) => wishlistApi.addToWishlist(productId),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] })

      const previous = queryClient.getQueryData(["wishlist"])
      const prevIds = Array.isArray(previous) ? previous : []
      const nextIds = prevIds.some((id) => String(id) === String(productId))
        ? prevIds
        : [...prevIds, productId]

      queryClient.setQueryData(["wishlist"], nextIds)
      return { previous }
    },
    onError: (error, variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["wishlist"], context.previous)
      }
      notify.error("Wishlist could not be updated", error)
      userOnError?.(error, variables, context)
    },
    onSuccess: async (data, variables, context) => {
      userOnSuccess?.(data, variables, context)
    },
    onSettled: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ["wishlist"] })
      await userOnSettled?.(...args)
    },
  })
}

export const useRemoveFromWishlist = (options = {}) => {
  const queryClient = useQueryClient()
  const { onError: userOnError, onSuccess: userOnSuccess, onSettled: userOnSettled, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (productId) => wishlistApi.removeFromWishlist(productId),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] })

      const previous = queryClient.getQueryData(["wishlist"])
      const prevIds = Array.isArray(previous) ? previous : []
      const nextIds = prevIds.filter((id) => String(id) !== String(productId))

      queryClient.setQueryData(["wishlist"], nextIds)
      return { previous }
    },
    onError: (error, variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["wishlist"], context.previous)
      }
      notify.error("Wishlist could not be updated", error)
      userOnError?.(error, variables, context)
    },
    onSuccess: async (data, variables, context) => {
      userOnSuccess?.(data, variables, context)
    },
    onSettled: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ["wishlist"] })
      await userOnSettled?.(...args)
    },
  })
}

export const useClearWishlist = (options = {}) => {
  const queryClient = useQueryClient()
  const { onError: userOnError, onSuccess: userOnSuccess, onSettled: userOnSettled, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: () => wishlistApi.clearWishlist(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] })

      const previous = queryClient.getQueryData(["wishlist"])
      queryClient.setQueryData(["wishlist"], [])
      return { previous }
    },
    onError: (error, variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["wishlist"], context.previous)
      }
      notify.error("Could not clear wishlist", error)
      userOnError?.(error, variables, context)
    },
    onSuccess: async (data, variables, context) => {
      notify.success("Wishlist cleared")
      userOnSuccess?.(data, variables, context)
    },
    onSettled: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ["wishlist"] })
      await userOnSettled?.(...args)
    },
  })
}
