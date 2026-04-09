import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import cartApi from "../APIs/cart.api"
import { getToken } from "../APIs/http"

// Cart hooks (server state via React Query).
// The cart is auth-protected, so queries are disabled when no token exists.

export const useCart = (options = {}) => {
  const enabled = Boolean(getToken())

  return useQuery({
    queryKey: ["cart"],
    queryFn: () => cartApi.getCart(),
    enabled,
    staleTime: 1000 * 10,
    ...options,
  })
}

export const useAddToCart = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, quantity }) => cartApi.addToCart({ productId, quantity }),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] })
      options.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useDecrementCartItem = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, amount = 1 }) => cartApi.decrementCartItem({ productId, amount }),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] })
      options.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useRemoveFromCart = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId) => cartApi.removeFromCart(productId),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] })
      options.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useClearCart = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] })
      options.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}
