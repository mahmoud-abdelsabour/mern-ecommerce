import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import ordersApi from "../APIs/orders.api"
import { getToken } from "../APIs/http"
import { notify } from "../utils/notify"

// Orders hooks (server state via React Query).
// Orders are auth-protected, so queries are disabled when no token exists.

const stableKey = (value) => {
  try {
    return JSON.stringify(value ?? {})
  } catch {
    return String(value ?? "")
  }
}

export const useOrders = (query = {}, options = {}) => {
  const enabled = Boolean(getToken())
  const key = stableKey(query)

  return useQuery({
    queryKey: ["orders", key],
    queryFn: () => ordersApi.getOrders(query),
    enabled,
    placeholderData: (prev) => prev,
    staleTime: 1000 * 30,
    ...options,
  })
}

export const useOrderById = (orderId, options = {}) => {
  const enabled = Boolean(getToken()) && Boolean(orderId)

  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => ordersApi.getOrderById(orderId),
    enabled,
    staleTime: 1000 * 30,
    ...options,
  })
}

export const useCreateOrder = (options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess: userOnSuccess, onError: userOnError, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: ({ products, shippingInfo }) => ordersApi.createOrder({ products, shippingInfo }),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] })
      await queryClient.invalidateQueries({ queryKey: ["cart"] })
      await userOnSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      notify.error("Could not place order", error)
      userOnError?.(error, variables, context)
    },
  })
}

export const useCancelOrder = (options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess: userOnSuccess, onError: userOnError, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (orderId) => ordersApi.cancelOrder(orderId),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] })
      if (variables) await queryClient.invalidateQueries({ queryKey: ["order", variables] })
      notify.success("Order cancelled")
      await userOnSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      notify.error("Could not cancel order", error)
      userOnError?.(error, variables, context)
    },
  })
}

export const useRequestReturn = (options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess: userOnSuccess, onError: userOnError, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: ({ orderId, returnedItems }) => ordersApi.requestReturn(orderId, { returnedItems }),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] })
      if (variables?.orderId) await queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] })
      await userOnSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      notify.error("Return request failed", error)
      userOnError?.(error, variables, context)
    },
  })
}
