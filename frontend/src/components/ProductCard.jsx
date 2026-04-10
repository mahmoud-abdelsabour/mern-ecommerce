import { Box, Stack, Image, HStack, Icon, Text, Button, IconButton, Checkbox } from '@chakra-ui/react'
import { FaStar } from 'react-icons/fa'
import { LuMinus, LuPlus } from "react-icons/lu"
import { MdFavorite, MdFavoriteBorder } from "react-icons/md"
import { ICON_SIZE } from '../constants/ui'
import { useNavigate } from "react-router-dom"
import { useAddToCart } from "../hooks/useCart"
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

  // Only the default storefront card is clickable.
  // Other variants (cart/order/return) use the card as a UI container with controls.
  const isClickable = variant === "default" && Boolean(productId)

  // Navigate to the product details page.
  const goToProduct = () => {
    if (!isClickable) return
    navigate(`/product/${productId}`)
  }

  // Mutations are safe to create per-card instance; React Query dedupes network and we invalidate the cart query on success.
  const addToCartMutation = useAddToCart()

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

    addToCartMutation.mutate({ productId, quantity: 1 })
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
      borderColor="gray.200"
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
      _hover={isClickable ? { borderColor: "gray.300" } : undefined}
    >
      <Box position="relative" w="100%" aspectRatio={1}>
        {variant === "default" && (
          <Box position="absolute" top="2" right="2" zIndex="1">
            {/* Wishlist toggle (top-right). Selectable boxed heart icon. */}
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
        )}
        {variant === "return" && (
          <Box position="absolute" top="2" left="2" zIndex="1">
            {/* Return flow: allow selecting items from a list of products. */}
            <Checkbox.Root
              checked={Boolean(selected)}
              onCheckedChange={(details) => onToggleSelected?.(details.checked)}
              colorPalette="teal"
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
      <Text fontSize="xs" color="gray.500" noOfLines={1}>
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
            onClick={() => onDecrease?.()}
            disabled={!onDecrease}
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
            onClick={() => onIncrease?.()}
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
            onClick={() => onDecrease?.()}
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
            onClick={() => onIncrease?.()}
          >
            <LuPlus size={ICON_SIZE} />
          </IconButton>
        </HStack>
      ) : variant === "order" ? (
        <Stack gap={0}>
          <Text fontSize="xs" fontWeight="700">
            Qty: {quantity}
          </Text>
          <Text fontSize="xs" color="gray.600">
            Item total: ${itemTotal.toFixed(2)}
          </Text>
        </Stack>
      ) : (
        <HStack>
          {/* Stop propagation so clicking these buttons doesn't trigger card navigation. */}
          <Button
            size="xs"
            variant="outline"
            flex="1"
            onClick={onAddToCart}
            disabled={addToCartMutation.isPending}
          >
            {addToCartMutation.isPending ? "Adding..." : "Add to cart"}
          </Button>
          <Button size="xs" colorScheme="teal" flex="1" onClick={(e) => e.stopPropagation()}>
            Buy now
          </Button>
        </HStack>
      )}
    </Stack>
  )
}

export { ProductCard }
