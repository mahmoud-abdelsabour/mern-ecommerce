import { Box, Stack, Image, HStack, Icon, Text, Button, IconButton, Checkbox } from '@chakra-ui/react'
import { FaStar } from 'react-icons/fa'
import { LuMinus, LuPlus } from "react-icons/lu"
import { ICON_SIZE } from '../constants/ui'
import { useNavigate } from "react-router-dom"

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
          <IconButton size="xs" variant="outline" aria-label="Decrease">
            <LuMinus size={ICON_SIZE} />
          </IconButton>
          <Text fontSize="xs" fontWeight="600">
            Qty: {quantity}
          </Text>
          <IconButton size="xs" variant="outline" aria-label="Increase">
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
          <Button size="xs" variant="outline" flex="1" onClick={(e) => e.stopPropagation()}>
            Add to cart
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
