import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import productsApi from "../APIs/products.api"
import reviewsApi from "../APIs/reviews.api"
import { getToken } from "../APIs/http"
import { notify } from "../utils/notify"

const invalidateProductReviewQueries = async (queryClient, productId) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["product", productId] }),
    queryClient.invalidateQueries({ queryKey: ["product-reviews", productId] }),
    queryClient.invalidateQueries({ queryKey: ["product-user-status", productId] }),
  ])
}

const REVIEWS_PAGE_SIZE = 10

/** Paginated product reviews (append pages with fetchNextPage). */
export const useProductReviewsInfinite = (productId, options = {}) => {
  return useInfiniteQuery({
    queryKey: ["product-reviews", productId],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      productsApi.getProductReviews(productId, { page: pageParam, limit: REVIEWS_PAGE_SIZE }),
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.hasMore ? lastPage.pagination.page + 1 : undefined,
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 2,
    ...options,
  })
}

/** Cart / wishlist / review eligibility for the current user (requires auth). */
export const useProductUserStatus = (productId, options = {}) => {
  const enabled = Boolean(productId) && Boolean(getToken())

  return useQuery({
    queryKey: ["product-user-status", productId],
    queryFn: () => productsApi.getProductUserStatus(productId),
    enabled,
    staleTime: 1000 * 30,
    ...options,
  })
}

export const useCreateReview = (productId, options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess: userOnSuccess, onError: userOnError, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: ({ rating, comment }) =>
      productsApi.createReview(productId, { rating, comment }),
    onSuccess: async (data, variables, context) => {
      await invalidateProductReviewQueries(queryClient, productId)
      userOnSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      notify.error("Review could not be submitted", error)
      userOnError?.(error, variables, context)
    },
  })
}

export const useUpdateReview = (productId, options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess: userOnSuccess, onError: userOnError, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: ({ reviewId, rating, comment }) =>
      reviewsApi.updateReview(reviewId, { rating, comment }),
    onSuccess: async (data, variables, context) => {
      await invalidateProductReviewQueries(queryClient, productId)
      userOnSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      notify.error("Review could not be updated", error)
      userOnError?.(error, variables, context)
    },
  })
}

export const useDeleteReview = (productId, options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess: userOnSuccess, onError: userOnError, ...rest } = options

  return useMutation({
    ...rest,
    mutationFn: (reviewId) => reviewsApi.deleteReview(reviewId),
    onSuccess: async (data, variables, context) => {
      await invalidateProductReviewQueries(queryClient, productId)
      userOnSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      notify.error("Review could not be removed", error)
      userOnError?.(error, variables, context)
    },
  })
}
