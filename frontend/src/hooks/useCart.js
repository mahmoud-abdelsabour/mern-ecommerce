import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import cartApi from "../APIs/cart.api"
import { getToken } from "../APIs/http"
import { notify } from "../utils/notify"

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
  const { onSuccess: userOnSuccess, onError: userOnError, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: ({ productId, quantity }) => cartApi.addToCart({ productId, quantity }),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] })
      userOnSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      notify.error("Could not add to cart", error)
      userOnError?.(error, variables, context)
    },
  })
}

export const useDecrementCartItem = (options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess: userOnSuccess, onError: userOnError, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: ({ productId, amount = 1 }) => cartApi.decrementCartItem({ productId, amount }),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] })
      userOnSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      notify.error("Could not update cart", error)
      userOnError?.(error, variables, context)
    },
  })
}

export const useRemoveFromCart = (options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess: userOnSuccess, onError: userOnError, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (productId) => cartApi.removeFromCart(productId),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] })
      userOnSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      notify.error("Could not remove item", error)
      userOnError?.(error, variables, context)
    },
  })
}

export const useClearCart = (options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess: userOnSuccess, onError: userOnError, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: () => cartApi.clearCart(),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] })
      notify.success("Cart cleared", "All items were removed from your cart.")
      userOnSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      notify.error("Could not clear cart", error)
      userOnError?.(error, variables, context)
    },
  })
}
