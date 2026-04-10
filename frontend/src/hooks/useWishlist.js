import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import wishlistApi from "../APIs/wishlist.api"
import { getToken } from "../APIs/http"

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

  return useMutation({
    mutationFn: (productId) => wishlistApi.addToWishlist(productId),
    // Optimistic update so the heart icon toggles instantly across the app.
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
      // Roll back optimistic update if the request fails.
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["wishlist"], context.previous)
      }
      options.onError?.(error, variables, context)
    },
    onSuccess: async (data, variables, context) => {
      options.onSuccess?.(data, variables, context)
    },
    onSettled: async (...args) => {
      // Ensure server is the source of truth after optimistic update.
      await queryClient.invalidateQueries({ queryKey: ["wishlist"] })
      options.onSettled?.(...args)
    },
    ...options,
  })
}

export const useRemoveFromWishlist = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId) => wishlistApi.removeFromWishlist(productId),
    // Optimistic update so the heart icon toggles instantly across the app.
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] })

      const previous = queryClient.getQueryData(["wishlist"])
      const prevIds = Array.isArray(previous) ? previous : []
      const nextIds = prevIds.filter((id) => String(id) !== String(productId))

      queryClient.setQueryData(["wishlist"], nextIds)
      return { previous }
    },
    onError: (error, variables, context) => {
      // Roll back optimistic update if the request fails.
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["wishlist"], context.previous)
      }
      options.onError?.(error, variables, context)
    },
    onSuccess: async (data, variables, context) => {
      options.onSuccess?.(data, variables, context)
    },
    onSettled: async (...args) => {
      // Ensure server is the source of truth after optimistic update.
      await queryClient.invalidateQueries({ queryKey: ["wishlist"] })
      options.onSettled?.(...args)
    },
    ...options,
  })
}

export const useClearWishlist = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => wishlistApi.clearWishlist(),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: ["wishlist"] })
      options.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}
