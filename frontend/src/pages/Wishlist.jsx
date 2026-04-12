import { Box, Button, EmptyState, Flex, HStack, Text, VStack } from "@chakra-ui/react"
import { FaHeartBroken } from "react-icons/fa"
import { Link as RouterLink } from "react-router-dom"
import { useQueries } from "@tanstack/react-query"
import ProductList from "../components/ProductList"
import { useClearWishlist, useWishlist } from "../hooks/useWishlist"
import { getToken } from "../APIs/http"
import productsApi from "../APIs/products.api"
import ProductGridSkeleton from "../components/skeletons/ProductGridSkeleton"

const Wishlist = () => {
  const token = getToken()
  const isLoggedIn = Boolean(token)

  const { data, isLoading, isError, error } = useWishlist()
  const clearWishlistMutation = useClearWishlist()
  const wishlistIds = data ?? []

  const productQueries = useQueries({
    queries: wishlistIds.map((id) => ({
      queryKey: ["product", id],
      queryFn: () => productsApi.getProductById(id),
      enabled: Boolean(isLoggedIn) && Boolean(id),
      staleTime: 1000 * 60 * 2,
    })),
  })

  const isProductsLoading = productQueries.some((q) => q.isLoading)
  const products = productQueries.map((q) => q.data?.product).filter(Boolean)

  const items = products.map((p) => ({
    id: p?.id ?? p?._id,
    title: p?.name ?? "Product",
    price: p?.price ?? 0,
    rating: p?.rating?.score ?? 0,
    brand: p?.brand?.name ?? "—",
    category: p?.category?.name ?? "—",
    image: p?.photos?.[0],
  }))

  if (!isLoggedIn) {
    return (
      <Flex minH="70vh" align="center" justify="center" px={4}>
        <EmptyState.Root size={"lg"}>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <FaHeartBroken />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>Login required</EmptyState.Title>
              <EmptyState.Description>Login to view your wishlist.</EmptyState.Description>
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
      <HStack justify="space-between" align="center" mb={4}>
        <Text fontSize="lg" fontWeight="700">
          Wishlist
        </Text>
        <Button
          size="sm"
          variant="outline"
          colorScheme="red"
          onClick={() => clearWishlistMutation.mutate()}
          disabled={clearWishlistMutation.isPending || wishlistIds.length === 0}
        >
          {clearWishlistMutation.isPending ? "Clearing..." : "Clear wishlist"}
        </Button>
      </HStack>

      {isError && (
        <Text fontSize="sm" color="red.500" mb={4}>
          Failed to load wishlist: {error?.response?.data?.message ?? error?.message ?? "Unknown error"}
        </Text>
      )}

      {isLoading || isProductsLoading ? (
        <ProductGridSkeleton count={8} />
      ) : items.length > 0 ? (
        <ProductList items={items} />
      ) : (
        <Flex minH="70vh" align="center" justify="center">
          <EmptyState.Root size={"lg"}>
            <EmptyState.Content>
              <EmptyState.Indicator>
                <FaHeartBroken />
              </EmptyState.Indicator>
              <VStack textAlign="center">
                <EmptyState.Title>Your Wishlist is empty</EmptyState.Title>
                <EmptyState.Description>Explore our products and add items to your Wishlist</EmptyState.Description>
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

export default Wishlist
