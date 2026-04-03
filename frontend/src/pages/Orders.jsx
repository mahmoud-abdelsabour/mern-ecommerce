import { Box, SimpleGrid, Text, Stack, Flex, EmptyState, VStack, Button } from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"
import OrderCard from "../components/OrderCard"
import { GoListUnordered } from "react-icons/go";


const orders = [
  {
    id: 1,
    createdAt: "Mar 14, 2026",
    paymentMethod: "COD",
    status: "pending",
    totalPrice: 329.0,
    items: [
      { image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80" },
      { image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80" },
      { image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80" },
    ],
  },
  {
    id: 2,
    createdAt: "Mar 02, 2026",
    paymentMethod: "COD",
    status: "shipped",
    totalPrice: 189.0,
    items: [
      { image: "https://images.unsplash.com/photo-1512446816042-444d6412670b?w=800&q=80" },
      { image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80" },
    ],
  },
  {
    id: 3,
    createdAt: "Feb 22, 2026",
    paymentMethod: "COD",
    status: "delivered",
    totalPrice: 64.0,
    items: [
      { image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80" },
    ],
  },
  {
    id: 4,
    createdAt: "Feb 10, 2026",
    paymentMethod: "COD",
    status: "cancelled",
    totalPrice: 99.0,
    items: [
      { image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&q=80" },
      { image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80" },
    ],
  },
  {
    id: 5,
    createdAt: "Jan 29, 2026",
    paymentMethod: "COD",
    status: "return requested",
    totalPrice: 54.0,
    items: [
      { image: "https://images.unsplash.com/photo-1518441902117-f7d38f5f4d9f?w=800&q=80" },
      { image: "https://images.unsplash.com/photo-1526401485004-2aa7f3b8f7da?w=800&q=80" },
    ],
  },
  {
    id: 6,
    createdAt: "Jan 12, 2026",
    paymentMethod: "COD",
    status: "returned",
    totalPrice: 210.0,
    items: [
      { image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80" },
    ],
  },
  {
    id: 7,
    createdAt: "Dec 28, 2025",
    paymentMethod: "COD",
    status: "refunded",
    totalPrice: 149.0,
    items: [
      { image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80" },
      { image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80" },
    ],
  },
]

const Orders = () => {
  const hasItems = orders.length > 0
  return (
    <Box maxW="1200px" mx="auto" px={4} py={8}>
      {hasItems ? (
        <>
          <Stack mb={6}>
            <Text fontSize="2xl" fontWeight="800">
              My Orders
            </Text>
            <Text fontSize="sm" color="gray.500">
              View active and past orders
            </Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, sm: 2, md: 2, lg: 3 }} gap={4}>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </SimpleGrid>
        </>
      ) : (
          <Flex minH="70vh" align="center" justify="center">
          <EmptyState.Root size={"lg"}>
            <EmptyState.Content>
              <EmptyState.Indicator>
                <GoListUnordered />
              </EmptyState.Indicator>
              <VStack textAlign="center">
                <EmptyState.Title>You has No Orders</EmptyState.Title>
                <EmptyState.Description>
                  Explore our products and items 
                </EmptyState.Description>
                <Button as={RouterLink} to="/">
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

export default Orders
