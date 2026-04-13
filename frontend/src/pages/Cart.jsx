import { Box, Button, EmptyState, Flex, HStack, Skeleton, Text, VStack } from "@chakra-ui/react"
import { LuShoppingCart } from "react-icons/lu"
import { Link as RouterLink } from "react-router-dom"
import ProductList from "../components/ProductList"
import { useAddToCart, useCart, useClearCart, useDecrementCartItem } from "../hooks/useCart"
import { getToken } from "../APIs/http"
import { ProductCard } from "../components/ProductCard"
import ProductGridSkeleton from "../components/skeletons/ProductGridSkeleton"

const Cart = () => {
  const token = getToken()
  const isLoggedIn = Boolean(token)

  const { data, isLoading, isError, error } = useCart()
  const cart = data ?? []

  const addToCartMutation = useAddToCart()
  const decrementMutation = useDecrementCartItem()
  const clearCartMutation = useClearCart()

  const items = cart.map((item) => {
    const product = item?.product
    return {
      id: product?.id ?? product?._id ?? item?.product,
      title: product?.name ?? "Product",
      price: product?.price ?? 0,
      rating: product?.rating?.score ?? 0,
      brand: "—",
      category: "—",
      image: product?.photos?.[0],
      quantity: item?.quantity ?? 1,
    }
  })

  if (!isLoggedIn) {
    return (
      <Flex minH="70vh" align="center" justify="center" px={4}>
        <EmptyState.Root size={"lg"}>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <LuShoppingCart />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>Login required</EmptyState.Title>
              <EmptyState.Description>Login to view your cart.</EmptyState.Description>
              <Button as={RouterLink} to="/login">
                Go to Login
              </Button>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      </Flex>
    )
  }

  return (
    <Box maxW="1200px" mx="auto" px={4} py={8}>
      {isError && (
        <Text fontSize="sm" color="state.error" mb={4}>
          Failed to load cart: {error?.response?.data?.message ?? error?.message ?? "Unknown error"}
        </Text>
      )}

      {isLoading ? (
        <VStack w="100%" gap={6} align="stretch">
          <ProductGridSkeleton count={4} variant="cart" />
          <HStack w="100%" justify="center" flexWrap="wrap" gap={3}>
            <Skeleton h="44px" w={{ base: "100%", md: "240px" }} rounded="md" />
            <Skeleton h="44px" w={{ base: "100%", md: "320px" }} rounded="md" />
          </HStack>
        </VStack>
      ) : items.length > 0 ? (
        <VStack w="100%" gap={6}>
          <Box w="100%">
            <ProductList
              items={items}
              variant="cart"
              renderItem={(item) => (
                <ProductCard
                  key={item.id}
                  data={item}
                  variant="cart"
                  onDecrease={() => decrementMutation.mutate({ productId: item.id, amount: 1 })}
                  onIncrease={() => addToCartMutation.mutate({ productId: item.id, quantity: 1 })}
                />
              )}
            />
          </Box>
          <HStack w="100%" justify="center" flexWrap="wrap" gap={3}>
            {items.length > 0 && (
              <Button
                variant="outline"
                colorPalette="neutral"
                size="lg"
                onClick={() => clearCartMutation.mutate()}
                disabled={clearCartMutation.isPending}
                w={{ base: "100%", md: "240px" }}
              >
                {clearCartMutation.isPending ? "Clearing..." : "Clear cart"}
              </Button>
            )}
            <Button
              as={RouterLink}
              to="/order/check-out"
              size="lg"
              colorPalette="brand"
              w={{ base: "100%", md: "320px" }}
            >
              Checkout
            </Button>
          </HStack>
        </VStack>
      ) : (
        <Flex minH="70vh" align="center" justify="center">
          <EmptyState.Root size={"lg"}>
            <EmptyState.Content>
              <EmptyState.Indicator>
                <LuShoppingCart />
              </EmptyState.Indicator>
              <VStack textAlign="center">
                <EmptyState.Title>Your cart is empty</EmptyState.Title>
                <EmptyState.Description>Explore our products and add items to your cart</EmptyState.Description>
                <Button as={RouterLink} to="/catalog">
                  Start Shopping
                </Button>
              </VStack>
            </EmptyState.Content>
          </EmptyState.Root>
        </Flex>
      )}
    </Box>
  )
}

export default Cart
