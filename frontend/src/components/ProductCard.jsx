import { Box, Stack, Image, HStack, Icon, Text, Button, IconButton, Checkbox } from '@chakra-ui/react'
import { FaStar } from 'react-icons/fa'
import { LuMinus, LuPlus } from "react-icons/lu"
import { MdFavorite, MdFavoriteBorder } from "react-icons/md"
import { ICON_SIZE } from '../constants/ui'
import { useNavigate } from "react-router-dom"
import { useAddToCart, useCart, useDecrementCartItem } from "../hooks/useCart"
import { useCartDrawer } from "../hooks/useCartDrawer"
import { getToken } from "../APIs/http"
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from "../hooks/useWishlist"

const ProductCard = ({
  data,
  variant = "default",
  selected,
  onToggleSelected,
  onIncrease,
  onDecrease,
}) => {
  // React Router navigation helper.
  const navigate = useNavigate()

  // Prefer `id` (frontend shape) and fall back to MongoDB `_id` (backend shape).
  // This id is used to navigate to the single-product page.
  const productId = data?.id ?? data?._id

  // Product cards are always clickable (navigate to product page) when an id exists,
  // regardless of the `variant` (cart/return/order/default/etc).
  // Interactive controls inside the card stop propagation to avoid unwanted navigation.
  const isClickable = Boolean(productId)

  // Navigate to the product details page.
  const goToProduct = () => {
    if (!isClickable) return
    navigate(`/product/${productId}`)
  }

  // Mutations are safe to create per-card instance; React Query dedupes network and we invalidate the cart query on success.
  const { openCartDrawer } = useCartDrawer()
  const addToCartMutation = useAddToCart()
  const decrementCartMutation = useDecrementCartItem()

  // Cart state is global (React Query) and shared across all cards.
  // We use it to render quantity controls when the item is already in the cart.
  const { data: cartData } = useCart()
  const cartItems = Array.isArray(cartData) ? cartData : []

  // Wishlist state is global (React Query) but safe to read in each card; all cards share the same cache.
  const { data: wishlistIds } = useWishlist()
  const addToWishlistMutation = useAddToWishlist()
  const removeFromWishlistMutation = useRemoveFromWishlist()

  const onAddToCart = (e) => {
    // Prevent card navigation when clicking the button.
    e.stopPropagation()

    if (!productId) return
    if (!getToken()) {
      navigate("/login")
      return
    }

    addToCartMutation.mutate(
      { productId, quantity: 1 },
      { onSuccess: () => openCartDrawer() }
    )
  }

  const onBuyNow = (e) => {
    // Prevent card navigation when clicking the button.
    e.stopPropagation()

    if (!productId) return
    if (!getToken()) {
      navigate("/login")
      return
    }

    // Checkout can render a single-product "buy now" flow via query param.
    navigate(`/order/check-out?buyNow=${encodeURIComponent(productId)}`)
  }

  const isLoggedIn = Boolean(getToken())

  // Determine whether this product is already in the wishlist.
  // Backend returns wishlist as an array of product IDs.
  const isInWishlist = Boolean(
    isLoggedIn &&
      productId &&
      Array.isArray(wishlistIds) &&
      wishlistIds.some((id) => String(id) === String(productId))
  )

  const wishlistIsBusy = addToWishlistMutation.isPending || removeFromWishlistMutation.isPending

  const onToggleWishlist = (e) => {
    // Prevent card navigation when clicking the wishlist button.
    e.stopPropagation()

    if (!productId) return

    // Wishlist is auth-protected; redirect to login if the user isn't logged in.
    if (!isLoggedIn) {
      navigate("/login")
      return
    }

    if (isInWishlist) {
      removeFromWishlistMutation.mutate(productId)
    } else {
      addToWishlistMutation.mutate(productId)
    }
  }

  // Find the current cart quantity for this product (0 means not in cart).
  const cartQuantity = (() => {
    if (!productId) return 0
    const match = cartItems.find((item) => {
      const itemProductId = item?.product?._id ?? item?.product?.id ?? item?.product
      return String(itemProductId) === String(productId)
    })
    return Number(match?.quantity ?? 0) || 0
  })()

  const onIncrementCart = (e) => {
    // Prevent card navigation when clicking the button.
    e.stopPropagation()
    if (!productId) return
    addToCartMutation.mutate({ productId, quantity: 1 })
  }

  const onDecrementCart = (e) => {
    // Prevent card navigation when clicking the button.
    e.stopPropagation()
    if (!productId) return
    decrementCartMutation.mutate({ productId, amount: 1 })
  }

  const title = data?.title ?? data?.name ?? "Product"
  const brand = data?.brand ?? "—"
  const category = data?.category ?? "—"
  const rating = data?.rating
  const price = Number(data?.price ?? data?.priceAtPurchase ?? 0)
  const quantity = Number(data?.quantity ?? 1)
  const image = data?.image ?? data?.photos?.[0]

  const itemTotal = price * quantity

  return (
    <Stack
      gap="2"
      borderWidth="1px"
      borderColor="surface.border"
      rounded="md"
      p={2}
      w="100%"
      maxW="200px"
      // Make the whole card behave like a link (click + keyboard).
      cursor={isClickable ? "pointer" : undefined}
      role={isClickable ? "link" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? goToProduct : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              // Accessibility: allow navigation via keyboard.
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                goToProduct()
              }
            }
          : undefined
      }
      _hover={isClickable ? { borderColor: "neutral.300", bg: "surface.subtle" } : undefined}
    >
      <Box position="relative" w="100%" aspectRatio={1}>
        {Boolean(productId) && (
          <Box position="absolute" top="2" right="2" zIndex="1">
            {/* Wishlist toggle (top-right). Selectable boxed heart icon (shown for all variants). */}
            <Box
              as="button"
              type="button"
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              onClick={onToggleWishlist}
              disabled={wishlistIsBusy}
              w="8"
              h="8"
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              rounded="md"
              borderWidth="1px"
              borderColor={isInWishlist ? "red.500" : "surface.border"}
              bg={isInWishlist ? "red.50" : "whiteAlpha.900"}
              _hover={
                wishlistIsBusy
                  ? undefined
                  : { borderColor: isInWishlist ? "red.600" : "neutral.300" }
              }
              _active={wishlistIsBusy ? undefined : { transform: "scale(0.98)" }}
              cursor={wishlistIsBusy ? "not-allowed" : "pointer"}
            >
              <Icon color={isInWishlist ? "red.500" : "text.muted"}>
                {isInWishlist ? (
                  <MdFavorite size={ICON_SIZE} />
                ) : (
                  <MdFavoriteBorder size={ICON_SIZE} />
                )}
              </Icon>
            </Box>
          </Box>
        )}
        {variant === "return" && (
          <Box position="absolute" top="2" left="2" zIndex="1" onClick={(e) => e.stopPropagation()}>
            {/* Return flow: allow selecting items from a list of products. */}
            <Checkbox.Root
              checked={Boolean(selected)}
              onCheckedChange={(details) => onToggleSelected?.(details.checked)}
              colorPalette="brand"
              size="sm"
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control w="5" h="5" bg="whiteAlpha.900" rounded="sm" />
            </Checkbox.Root>
          </Box>
        )}
        <Image
          src={image}
          alt={title}
          w="100%"
          h="100%"
          objectFit="cover"
          rounded="md"
          draggable={false}
        />
      </Box>
      <Text fontWeight="semibold" fontSize="sm" noOfLines={2}>
        {title}
      </Text>
      <Text fontSize="xs" color="text.muted" noOfLines={1}>
        {brand} • {category}
      </Text>
      <HStack justify="space-between" align="center">
        <Text fontWeight="medium" fontSize="sm">
          ${price}
        </Text>
        {rating != null && (
          <HStack gap="1">
            <Icon color="orange.400">
              <FaStar size={ICON_SIZE} />
            </Icon>
            <Text fontWeight="medium" fontSize="sm">
              {rating}
            </Text>
          </HStack>
        )}
      </HStack>

      {variant === "cart" ? (
        <HStack justify="space-between" align="center">
          <IconButton
            size="xs"
            variant="outline"
            aria-label="Decrease"
            onClick={(e) => {
              e.stopPropagation()
              onDecrease?.()
            }}
            disabled={!onDecrease}
          >
            <LuMinus size={ICON_SIZE} />
          </IconButton>
          <Text fontSize="xs" fontWeight="600">
            {quantity}
          </Text>
          <IconButton
            size="xs"
            variant="outline"
            aria-label="Increase"
            onClick={(e) => {
              e.stopPropagation()
              onIncrease?.()
            }}
            disabled={!onIncrease}
          >
            <LuPlus size={ICON_SIZE} />
          </IconButton>
        </HStack>
      ) : variant === "return" ? (
        <HStack justify="space-between" align="center">
          <IconButton
            size="xs"
            variant="outline"
            aria-label="Decrease"
            onClick={(e) => {
              e.stopPropagation()
              onDecrease?.()
            }}
          >
            <LuMinus size={ICON_SIZE} />
          </IconButton>
          <Text fontSize="xs" fontWeight="600">
            Qty: {quantity}
          </Text>
          <IconButton
            size="xs"
            variant="outline"
            aria-label="Increase"
            onClick={(e) => {
              e.stopPropagation()
              onIncrease?.()
            }}
          >
            <LuPlus size={ICON_SIZE} />
          </IconButton>
        </HStack>
      ) : variant === "order" ? (
        <Stack gap={0}>
          <Text fontSize="xs" fontWeight="700">
            Qty: {quantity}
          </Text>
          <Text fontSize="xs" color="text.muted">
            Item total: ${itemTotal.toFixed(2)}
          </Text>
        </Stack>
      ) : (
        <HStack>
          {/* Stop propagation so clicking these buttons doesn't trigger card navigation. */}
          {cartQuantity > 0 ? (
            <HStack flex="1" justify="space-between" align="center">
              <IconButton
                size="xs"
                variant="outline"
                colorPalette="neutral"
                aria-label="Decrease"
                onClick={onDecrementCart}
                disabled={decrementCartMutation.isPending}
              >
                <LuMinus size={ICON_SIZE} />
              </IconButton>
              <Text fontSize="xs" fontWeight="600">
                {cartQuantity}
              </Text>
              <IconButton
                size="xs"
                variant="outline"
                colorPalette="neutral"
                aria-label="Increase"
                onClick={onIncrementCart}
                disabled={addToCartMutation.isPending}
              >
                <LuPlus size={ICON_SIZE} />
              </IconButton>
            </HStack>
          ) : (
            <Button
              size="xs"
              variant="outline"
              colorPalette="neutral"
              flex="1"
              onClick={onAddToCart}
              disabled={addToCartMutation.isPending}
            >
              {addToCartMutation.isPending ? "Adding..." : "Add to cart"}
            </Button>
          )}
          <Button size="xs" colorPalette="brand" flex="1" onClick={onBuyNow}>
            Buy now
          </Button>
        </HStack>
      )}
    </Stack>
  )
}

export { ProductCard }
