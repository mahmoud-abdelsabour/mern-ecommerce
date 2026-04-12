import { useMemo, useState, useCallback } from "react"
import {
  AspectRatio,
  Box,
  Carousel,
  CloseButton,
  Dialog,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Portal,
  Text,
  useCarouselContext,
  RatingGroup,
  Button,
  Stack,
  Collapsible,
  Textarea,
} from "@chakra-ui/react"
import { LuChevronLeft, LuChevronRight, LuChevronDown, LuMinus, LuPlus } from "react-icons/lu"
import { MdFavorite, MdFavoriteBorder } from "react-icons/md"
import ReviewRow from "../components/ReviewRow"
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom"
import { useProductById } from "../hooks/useProducts"
import { useCreateReview, useProductUserStatus } from "../hooks/useProductReviews"
import { notify } from "../utils/notify"
import { useAddToCart, useCart, useDecrementCartItem } from "../hooks/useCart"
import { useCartDrawer } from "../hooks/useCartDrawer"
import { getToken } from "../APIs/http"
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from "../hooks/useWishlist"
import { ICON_SIZE } from "../constants/ui"


const MAX_REVIEW_COMMENT = 1000

const Product = () => {
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")

  // Read the `:productId` route param from `/product/:productId`.
  const { productId } = useParams()
  const navigate = useNavigate()

  // Fetch the real product data from the backend.
  // Response shape: `{ product, reviewsPreview, hasMoreReviews }`.
  const { data, isLoading, isError, error } = useProductById(productId)

  const { data: userProductStatus, isLoading: userStatusLoading } = useProductUserStatus(productId)
  const createReviewMutation = useCreateReview(productId)

  // Normalize the server response to predictable values for rendering.
  const product = data?.product ?? null
  const reviewsPreview = data?.reviewsPreview ?? []
  const hasMoreReviews = Boolean(data?.hasMoreReviews)

  // Convert `product.photos` (string URLs) into the shape expected by Chakra Carousel.
  // If no photos exist, we show a single placeholder image.
  const items = useMemo(() => {
    const photos = product?.photos ?? []
    if (!photos || photos.length === 0) {
      return [
        {
          label: product?.name ?? "Product",
          url: "https://placehold.co/1200x900?text=No+Image",
        },
      ]
    }
    return photos.map((url, index) => ({
      label: `Photo ${index + 1}`,
      url,
    }))
  }, [product])

  const reviewsCountLabel = isLoading
    ? "—"
    : String(product?.rating?.voters ?? reviewsPreview.length)

  const { openCartDrawer } = useCartDrawer()
  const addToCartMutation = useAddToCart()
  const decrementCartMutation = useDecrementCartItem()

  // Wishlist state for the current product.
  const { data: wishlistIds } = useWishlist()
  const addToWishlistMutation = useAddToWishlist()
  const removeFromWishlistMutation = useRemoveFromWishlist()

  // Cart state for the current product (to show qty controls instead of "Add to cart").
  const { data: cartData } = useCart()
  const cartItems = Array.isArray(cartData) ? cartData : []

  const normalizedProductId = product?.id ?? product?._id ?? productId
  const isLoggedIn = Boolean(getToken())

  const cartQuantity = (() => {
    if (!normalizedProductId) return 0
    const match = cartItems.find((item) => {
      const itemProductId = item?.product?._id ?? item?.product?.id ?? item?.product
      return String(itemProductId) === String(normalizedProductId)
    })
    return Number(match?.quantity ?? 0) || 0
  })()

  const isInWishlist = Boolean(
    isLoggedIn &&
      normalizedProductId &&
      Array.isArray(wishlistIds) &&
      wishlistIds.some((id) => String(id) === String(normalizedProductId))
  )

  const wishlistIsBusy = addToWishlistMutation.isPending || removeFromWishlistMutation.isPending

  const onAddToCart = () => {
    if (!normalizedProductId) return
    if (!getToken()) {
      navigate("/login")
      return
    }
    addToCartMutation.mutate(
      { productId: normalizedProductId, quantity: 1 },
      { onSuccess: () => openCartDrawer() }
    )
  }

  const onIncrementCart = () => {
    if (!normalizedProductId) return
    addToCartMutation.mutate({ productId: normalizedProductId, quantity: 1 })
  }

  const onDecrementCart = () => {
    if (!normalizedProductId) return
    decrementCartMutation.mutate({ productId: normalizedProductId, amount: 1 })
  }

  const onToggleWishlist = () => {
    if (!normalizedProductId) return

    if (!isLoggedIn) {
      navigate("/login")
      return
    }

    if (isInWishlist) {
      removeFromWishlistMutation.mutate(normalizedProductId)
    } else {
      addToWishlistMutation.mutate(normalizedProductId)
    }
  }

  const onBuyNow = () => {
    if (!normalizedProductId) return

    if (!isLoggedIn) {
      navigate("/login")
      return
    }

    navigate(`/order/check-out?buyNow=${encodeURIComponent(normalizedProductId)}`)
  }

  const onSubmitReview = useCallback(() => {
    if (!productId) return
    if (!isLoggedIn) {
      navigate("/login")
      return
    }
    if (createReviewMutation.isPending) return

    const trimmed = reviewComment.trim()
    if (trimmed.length > MAX_REVIEW_COMMENT) {
      notify.warning(
        "Comment too long",
        `Please keep your comment under ${MAX_REVIEW_COMMENT} characters.`
      )
      return
    }

    const rating = Number(reviewRating)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      notify.warning("Rating required", "Please choose a star rating from 1 to 5.")
      return
    }

    createReviewMutation.mutate(
      { rating, comment: trimmed },
      {
        onSuccess: () => {
          notify.success("Review published", "Thank you for sharing your feedback.")
          setReviewRating(0)
          setReviewComment("")
        },
      }
    )
  }, [
    productId,
    isLoggedIn,
    navigate,
    reviewComment,
    reviewRating,
    createReviewMutation,
  ])

  return (
    <Box maxW="1200px" mx="auto" px={4} mt={6} pb={10}>
      {/* Show request errors (instead of silently rendering an empty product). */}
      {isError && (
        <Text fontSize="sm" color="red.500" mb={4}>
          Failed to load product: {error?.response?.data?.message ?? error?.message ?? "Unknown error"}
        </Text>
      )}
      <Text fontSize="sm" color="gray.500" fontWeight="600">
        {/* Brand name */}
        {isLoading ? "Loading..." : product?.brand?.name ?? "—"}
      </Text>
      <Text fontSize="3xl" fontWeight="800" mb={4}>
        {/* Product name */}
        {isLoading ? "Loading..." : product?.name ?? "Product"}
      </Text>
      <Dialog.Root size="full">
        <Flex justify="center">
          <Box position="relative" maxW="2xl" w="100%">
            <Box position="absolute" top="2" right="2" zIndex="1">
              {/* Wishlist toggle (top-right). Selectable boxed heart icon. */}
              <Box
                as="button"
                type="button"
                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                onClick={onToggleWishlist}
                disabled={wishlistIsBusy || isLoading || !product}
                w="10"
                h="10"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                rounded="md"
                borderWidth="1px"
                borderColor={isInWishlist ? "red.500" : "gray.200"}
                bg={isInWishlist ? "red.50" : "whiteAlpha.900"}
                _hover={
                  wishlistIsBusy
                    ? undefined
                    : { borderColor: isInWishlist ? "red.600" : "gray.300" }
                }
                _active={wishlistIsBusy ? undefined : { transform: "scale(0.98)" }}
                cursor={wishlistIsBusy ? "not-allowed" : "pointer"}
              >
                <Icon color={isInWishlist ? "red.500" : "gray.600"}>
                  {isInWishlist ? (
                    <MdFavorite size={ICON_SIZE} />
                  ) : (
                    <MdFavoriteBorder size={ICON_SIZE} />
                  )}
                </Icon>
              </Box>
            </Box>

            <Carousel.Root slideCount={items.length} maxW="2xl" gap="4" w="100%">
            {/* Product images carousel (click image to open full-screen dialog). */}
            <Carousel.Control justifyContent="center" gap="4" width="full">
              <Carousel.PrevTrigger asChild>
                <IconButton size="xs" variant="outline">
                  <LuChevronLeft />
                </IconButton>
              </Carousel.PrevTrigger>

              <Carousel.ItemGroup width="full">
                {items.map((item, index) => (
                  <Carousel.Item key={index} index={index}>
                    <Dialog.Trigger asChild>
                      <Image
                        aspectRatio="16/9"
                        src={item.url}
                        alt={item.label}
                        w="100%"
                        h="100%"
                        objectFit="cover"
                        cursor="pointer"
                      />
                    </Dialog.Trigger>
                  </Carousel.Item>
                ))}
              </Carousel.ItemGroup>

              <Carousel.NextTrigger asChild>
                <IconButton size="xs" variant="outline">
                  <LuChevronRight />
                </IconButton>
              </Carousel.NextTrigger>
            </Carousel.Control>

            <Carousel.IndicatorGroup>
              {items.map((item, index) => (
                <Carousel.Indicator
                  key={index}
                  index={index}
                  unstyled
                  _current={{
                    outline: "2px solid currentColor",
                    outlineOffset: "2px",
                  }}
                >
                  <Image
                    w="20"
                    aspectRatio="16/9"
                    src={item.url}
                    alt={item.label}
                    objectFit="cover"
                  />
                </Carousel.Indicator>
              ))}
            </Carousel.IndicatorGroup>
            </Carousel.Root>
          </Box>
        </Flex>

        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content bg="transparent" shadow="none">
              <Dialog.CloseTrigger asChild>
                <CloseButton size="lg" color="white" />
              </Dialog.CloseTrigger>

              <Dialog.Body
                display="flex"
                alignItems="center"
                justifyContent="center"
                h="full"
                p={0}
              >
                <Carousel.Root slideCount={items.length} w="full" h="full">
                  <Carousel.Control justifyContent="center" px="4" gap="4">
                    <Carousel.PrevTrigger asChild>
                      <IconButton size="xs" variant="ghost">
                        <LuChevronLeft />
                      </IconButton>
                    </Carousel.PrevTrigger>

                    <Carousel.ItemGroup width="full">
                      {items.map((item, index) => (
                        <Carousel.Item key={index} index={index}>
                          <AspectRatio ratio={16 / 9} maxH="72vh" w="full">
                            <Image
                              src={item.url}
                              alt={item.label}
                              objectFit="contain"
                            />
                          </AspectRatio>
                        </Carousel.Item>
                      ))}
                    </Carousel.ItemGroup>

                    <Carousel.NextTrigger asChild>
                      <IconButton size="xs" variant="ghost">
                        <LuChevronRight />
                      </IconButton>
                    </Carousel.NextTrigger>
                  </Carousel.Control>

                  <CarouselThumbnails items={items} />
                </Carousel.Root>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* price + rating */}
      <HStack justify="space-between" align="center" mt={4}>
        <Text fontSize="xl" fontWeight="700">
          {/* Price */}
          {isLoading ? "—" : `$${Number(product?.price ?? 0).toFixed(2)}`}
        </Text>
        <HStack gap="2" align="center">
          {/* Average rating and number of voters */}
          <RatingGroup.Root
            readOnly
            count={5}
            value={Number(product?.rating?.score ?? 0)}
            size="sm"
          >
            <RatingGroup.HiddenInput />
            <RatingGroup.Control />
          </RatingGroup.Root>
          <Text fontSize="sm" color="gray.500">
            ({isLoading ? "—" : String(product?.rating?.voters ?? 0)})
          </Text>
        </HStack>
      </HStack>
      
      {/*buying buttons */}
      <HStack mt={3} gap={3} justify="center" mb={6}>
        {cartQuantity > 0 ? (
          <HStack minW="140px" justify="space-between" align="center">
            <IconButton
              size="sm"
              variant="outline"
              aria-label="Decrease"
              onClick={onDecrementCart}
              disabled={isLoading || decrementCartMutation.isPending || !product}
            >
              <LuMinus size={ICON_SIZE} />
            </IconButton>
            <Text fontSize="sm" fontWeight="700">
              Qty: {cartQuantity}
            </Text>
            <IconButton
              size="sm"
              variant="outline"
              aria-label="Increase"
              onClick={onIncrementCart}
              disabled={isLoading || addToCartMutation.isPending || !product}
            >
              <LuPlus size={ICON_SIZE} />
            </IconButton>
          </HStack>
        ) : (
          <Button
            variant="outline"
            size="sm"
            minW="140px"
            onClick={onAddToCart}
            disabled={isLoading || addToCartMutation.isPending || !product}
          >
            {addToCartMutation.isPending ? "Adding..." : "Add to cart"}
          </Button>
        )}
        <Button
          colorScheme="teal"
          size="sm"
          minW="140px"
          onClick={onBuyNow}
          disabled={isLoading || !product}
        >
          Buy now
        </Button>
      </HStack>

      {/* description */}
      <Collapsible.Root collapsedHeight="100px">
        <Collapsible.Content
          _closed={{
            shadow: "inset 0 -12px 12px -12px var(--shadow-color)",
            shadowColor: "blackAlpha.500",
          }}
        >
          <Stack padding="4" borderWidth="1px" rounded="l2">
            <Text fontSize="lg" fontWeight="700">
              Description
            </Text>
            <Text fontSize="sm" color="gray.600">
              {/* Description text */}
              {isLoading
                ? "Loading description..."
                : product?.description ?? "No description available."}
            </Text>
          </Stack>
        </Collapsible.Content>
        <Collapsible.Trigger asChild mt="4">
          <Button variant="outline" size="sm">
            <Collapsible.Context>
              {(api) => (api.open ? "Show Less" : "Show More")}
            </Collapsible.Context>
            <Collapsible.Indicator
              transition="transform 0.2s"
              _open={{ transform: "rotate(180deg)" }}
            >
              <LuChevronDown />
            </Collapsible.Indicator>
          </Button>
        </Collapsible.Trigger>
      </Collapsible.Root>

      {/* add review */}
      <Stack mt={8} gap={3}>
        <Text fontSize="md" fontWeight="700">
          Write a review
        </Text>
        {!isLoggedIn ? (
          <Text fontSize="sm" color="gray.600">
            <Button
              variant="link"
              colorPalette="teal"
              size="sm"
              p={0}
              h="auto"
              minW={0}
              onClick={() => navigate("/login")}
            >
              Sign in
            </Button>{" "}
            to see if you can rate this product. Only customers who have received it from a
            completed order may submit a review.
          </Text>
        ) : userStatusLoading ? (
          <Text fontSize="sm" color="gray.500">
            Checking whether you can review this product…
          </Text>
        ) : userProductStatus?.hasReviewed ? (
          <Text fontSize="sm" color="gray.600">
            You have already reviewed this product.
          </Text>
        ) : !userProductStatus?.canReview ? (
          <Text fontSize="sm" color="gray.600">
            Reviews are limited to customers who purchased this item and have a delivered (or
            completed return/refund) order including it. Once you are eligible, a rating and
            optional comment will appear here.
          </Text>
        ) : (
          <>
            <Text fontSize="xs" color="gray.500">
              Rating (required) · Comment optional (max {MAX_REVIEW_COMMENT} characters)
            </Text>
            <RatingGroup.Root
              count={5}
              size="sm"
              value={reviewRating}
              onValueChange={(e) => setReviewRating(Number(e.value) || 0)}
            >
              <RatingGroup.HiddenInput />
              <RatingGroup.Control />
            </RatingGroup.Root>
            <Textarea
              placeholder="Share your experience (optional)…"
              minH="130px"
              value={reviewComment}
              maxLength={MAX_REVIEW_COMMENT}
              onChange={(e) => setReviewComment(e.target.value)}
            />
            <Text fontSize="xs" color="gray.500">
              {reviewComment.length}/{MAX_REVIEW_COMMENT}
            </Text>
            <Button
              mt={2}
              alignSelf="flex-start"
              colorPalette="teal"
              onClick={onSubmitReview}
              loading={createReviewMutation.isPending}
              disabled={!product || createReviewMutation.isPending}
            >
              Submit review
            </Button>
          </>
        )}
      </Stack>

      {/* reviews (preview from product payload; full list lives on /product/:id/reviews) */}
      <Stack mt={8} gap={4}>
        <Text fontSize="2xl" fontWeight="700">
          Reviews ({reviewsCountLabel})
        </Text>
        {isLoading ? (
          <Text fontSize="sm" color="gray.500">
            Loading reviews…
          </Text>
        ) : reviewsPreview.length > 0 ? (
          <Stack gap={4}>
            {reviewsPreview.map((review) => (
              <ReviewRow
                key={review?.id ?? review?._id}
                review={review}
                productId={productId}
              />
            ))}
            {hasMoreReviews && productId ? (
              <Button
                as={RouterLink}
                to={`/product/${encodeURIComponent(productId)}/reviews`}
                variant="outline"
                size="sm"
                alignSelf="flex-start"
              >
                Show more
              </Button>
            ) : null}
          </Stack>
        ) : (
          <Text fontSize="sm" color="gray.500">
            No reviews yet.
          </Text>
        )}
      </Stack>
    </Box>
  )
}

const CarouselThumbnails = ({ items }) => {
  const carousel = useCarouselContext()

  return (
    <HStack justify="center">
      <Carousel.ProgressText mr="4" />
      {items.map((item, index) => (
        <AspectRatio
          key={index}
          ratio={1}
          w="16"
          cursor="pointer"
          onClick={() => carousel.scrollTo(index)}
        >
          <Image
            src={item.url}
            alt={item.label}
            w="100%"
            h="100%"
            objectFit="cover"
          />
        </AspectRatio>
      ))}
    </HStack>
  )
}

export default Product
