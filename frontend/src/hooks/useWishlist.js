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
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: ["wishlist"] })
      options.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useRemoveFromWishlist = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId) => wishlistApi.removeFromWishlist(productId),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: ["wishlist"] })
      options.onSuccess?.(data, variables, context)
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
