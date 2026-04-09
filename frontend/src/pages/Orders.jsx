import { Box, Button, EmptyState, Flex, SimpleGrid, Stack, Text, VStack } from "@chakra-ui/react"
import { GoListUnordered } from "react-icons/go"
import { Link as RouterLink } from "react-router-dom"
import { useMemo, useState } from "react"
import OrderCard from "../components/OrderCard"
import PaginationControls from "../components/PaginationControls"
import { useOrders } from "../hooks/useOrders"
import { getToken } from "../APIs/http"

const formatDate = (value) => {
  if (!value) return "—"
  try {
    return new Date(value).toLocaleDateString()
  } catch {
    return "—"
  }
}

const Orders = () => {
  const token = getToken()
  const isLoggedIn = Boolean(token)

  const pageSize = 12
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, error } = useOrders({ page, limit: pageSize })

  const pagination = data?.pagination ?? null

  const items = useMemo(() => {
    // Adapt backend order shape to the UI shape expected by `OrderCard`.
    const orders = data?.orders ?? []
    return orders.map((o) => ({
      id: o?.id ?? o?._id,
      createdAt: formatDate(o?.createdAt),
      paymentMethod: "COD",
      status: o?.deliveryStatus ?? "pending",
      totalPrice: o?.totalPrice ?? 0,
      items: (o?.products ?? []).map((p) => ({ image: p?.photos?.[0] })).filter((x) => x.image),
    }))
  }, [data])

  if (!isLoggedIn) {
    return (
      <Flex minH="70vh" align="center" justify="center" px={4}>
        <EmptyState.Root size={"lg"}>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <GoListUnordered />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>Login required</EmptyState.Title>
              <EmptyState.Description>Login to view your orders.</EmptyState.Description>
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
      <Stack mb={6}>
        <Text fontSize="2xl" fontWeight="800">
          My Orders
        </Text>
        <Text fontSize="sm" color="gray.500">
          View active and past orders
        </Text>
        {isError && (
          <Text fontSize="sm" color="red.500">
            Failed to load orders: {error?.response?.data?.message ?? error?.message ?? "Unknown error"}
          </Text>
        )}
      </Stack>

      {isLoading ? (
        <Flex minH="50vh" align="center" justify="center">
          <Text color="gray.500">Loading orders...</Text>
        </Flex>
      ) : items.length > 0 ? (
        <>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 2, lg: 3 }} gap={4}>
            {items.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </SimpleGrid>

          {pagination?.totalOrders > pageSize && (
            <Box mt={6} display="flex" justifyContent="center">
              <PaginationControls
                count={pagination.totalOrders}
                pageSize={pagination.limit ?? pageSize}
                page={Number(pagination.currentPage ?? page) || page}
                onPageChange={setPage}
                isDisabled={isLoading}
              />
            </Box>
          )}
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
                <EmptyState.Description>Explore our products and items</EmptyState.Description>
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

export default Orders
