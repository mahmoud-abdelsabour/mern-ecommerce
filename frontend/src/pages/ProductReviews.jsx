import { useCallback, useEffect, useMemo, useRef } from "react"
import { Box, Button, HStack, Skeleton, Stack, Text } from "@chakra-ui/react"
import { Link as RouterLink, useParams } from "react-router-dom"
import ReviewRow from "../components/ReviewRow"
import ReviewRowSkeleton from "../components/skeletons/ReviewRowSkeleton"
import { useProductReviewsInfinite } from "../hooks/useProductReviews"
import { useProductById } from "../hooks/useProducts"

const ProductReviews = () => {
  const { productId } = useParams()
  const loadMoreSentinelRef = useRef(null)

  const {
    data: productPayload,
    isLoading: productLoading,
    isError: productIsError,
    error: productError,
  } = useProductById(productId)

  const product = productPayload?.product ?? null

  const {
    data: pagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: reviewsLoading,
    isError: reviewsIsError,
    error: reviewsError,
    refetch,
  } = useProductReviewsInfinite(productId)

  const reviews = useMemo(
    () => pagesData?.pages?.flatMap((p) => p?.reviews ?? []) ?? [],
    [pagesData]
  )

  const totalLoaded = reviews.length
  const totalAvailable = pagesData?.pages?.[0]?.pagination?.total

  const onIntersect = useCallback(
    (entries) => {
      const first = entries[0]
      if (!first?.isIntersecting) return
      if (!hasNextPage || isFetchingNextPage) return
      fetchNextPage()
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  )

  useEffect(() => {
    const node = loadMoreSentinelRef.current
    if (!node || !productId || !hasNextPage) return

    const observer = new IntersectionObserver(onIntersect, {
      root: null,
      rootMargin: "240px 0px",
      threshold: 0,
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [onIntersect, productId, hasNextPage])

  const initialReviewsLoading = reviewsLoading && totalLoaded === 0

  if (!productId) {
    return (
      <Box maxW="1200px" mx="auto" px={4} mt={6} pb={12}>
        <Text fontSize="sm" color="gray.600">
          Missing product id.
        </Text>
      </Box>
    )
  }

  return (
    <Box maxW="1200px" mx="auto" px={4} mt={6} pb={12}>
      <Stack gap={6}>
        <HStack flexWrap="wrap" gap={3} align="center">
          <Button as={RouterLink} to={`/product/${productId}`} variant="outline" size="sm">
            ← Back to product
          </Button>
          {productLoading ? (
            <Skeleton h="18px" w="260px" />
          ) : productIsError ? (
            <Text fontSize="lg" fontWeight="700" color="gray.700">
              Reviews
            </Text>
          ) : (
            <Text fontSize="lg" fontWeight="700">
              Reviews · {product?.name ?? "Product"}
            </Text>
          )}
        </HStack>

        {productIsError && (
          <Text fontSize="sm" color="red.500">
            {productError?.response?.data?.message ??
              productError?.message ??
              "Could not load product details."}
          </Text>
        )}

        {reviewsIsError && (
          <Stack gap={3} borderWidth="1px" borderColor="red.200" rounded="md" p={4} bg="red.50">
            <Text fontSize="sm" color="red.700">
              {reviewsError?.response?.data?.message ??
                reviewsError?.message ??
                "Could not load reviews."}
            </Text>
            <Button size="sm" variant="outline" colorPalette="red" onClick={() => refetch()}>
              Try again
            </Button>
          </Stack>
        )}

        {initialReviewsLoading && (
          <Stack gap={4}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <ReviewRowSkeleton key={`review-initial-skel-${idx}`} />
            ))}
          </Stack>
        )}

        {!initialReviewsLoading && !reviewsIsError && reviews.length === 0 && (
          <Text fontSize="sm" color="gray.600">
            No reviews yet for this product.
          </Text>
        )}

        {reviews.length > 0 && (
          <Stack gap={1}>
            <Text fontSize="sm" color="gray.500">
              Showing {totalLoaded}
              {typeof totalAvailable === "number" ? ` of ${totalAvailable}` : ""} reviews
            </Text>
            <Stack gap={4}>
              {reviews.map((review) => (
                <ReviewRow
                  key={review?.id ?? review?._id}
                  review={review}
                  productId={productId}
                />
              ))}
              {isFetchingNextPage
                ? Array.from({ length: 2 }).map((_, idx) => (
                    <ReviewRowSkeleton key={`review-next-skel-${idx}`} />
                  ))
                : null}
            </Stack>
          </Stack>
        )}

        {hasNextPage ? (
          <Stack gap={3} align="stretch">
            <Box ref={loadMoreSentinelRef} h="1px" w="full" aria-hidden />
            <Button
              variant="outline"
              size="sm"
              alignSelf="center"
              onClick={() => fetchNextPage()}
              loading={isFetchingNextPage}
              disabled={isFetchingNextPage}
            >
              Load more reviews
            </Button>
          </Stack>
        ) : null}

        {!reviewsIsError && !initialReviewsLoading && reviews.length > 0 && !hasNextPage && (
          <Text fontSize="xs" color="gray.500" textAlign="center">
            You have reached the end of the reviews.
          </Text>
        )}
      </Stack>
    </Box>
  )
}

export default ProductReviews
