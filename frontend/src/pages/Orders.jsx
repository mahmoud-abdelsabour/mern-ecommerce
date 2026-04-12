import {
  Box,
  Button,
  EmptyState,
  Flex,
  HStack,
  Portal,
  Select,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  createListCollection,
} from "@chakra-ui/react"
import { GoListUnordered } from "react-icons/go"
import { Link as RouterLink, useSearchParams } from "react-router-dom"
import { useMemo, useCallback } from "react"
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

const SORT_VALUES = ["date-desc", "date-asc", "price-desc", "price-asc"]
const STATUS_VALUES = [
  "all",
  "pending",
  "shipped",
  "delivered",
  "cancelled",
  "return requested",
  "returned",
  "refunded",
]

const sortCollection = createListCollection({
  items: [
    { label: "Date: newest → oldest", value: "date-desc" },
    { label: "Date: oldest → newest", value: "date-asc" },
    { label: "Total: highest → lowest", value: "price-desc" },
    { label: "Total: lowest → highest", value: "price-asc" },
  ],
})

const deliveryStatusCollection = createListCollection({
  items: [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Return requested", value: "return requested" },
    { label: "Returned", value: "returned" },
    { label: "Refunded", value: "refunded" },
  ],
})

const Orders = () => {
  const token = getToken()
  const isLoggedIn = Boolean(token)

  const pageSize = 12
  const [searchParams, setSearchParams] = useSearchParams()

  const sortKey = useMemo(() => {
    const raw = searchParams.get("sort")
    return SORT_VALUES.includes(raw) ? raw : "date-desc"
  }, [searchParams])

  const deliveryStatus = useMemo(() => {
    const raw = (searchParams.get("deliveryStatus") || "all").toLowerCase()
    return STATUS_VALUES.includes(raw) ? raw : "all"
  }, [searchParams])

  const page = useMemo(() => {
    const n = Number(searchParams.get("page"))
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1
  }, [searchParams])

  const setSortKey = useCallback(
    (value) => {
      const v = value || "date-desc"
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (v === "date-desc") next.delete("sort")
          else next.set("sort", v)
          next.delete("page")
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  const setDeliveryStatus = useCallback(
    (value) => {
      const v = value || "all"
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (v === "all") next.delete("deliveryStatus")
          else next.set("deliveryStatus", v)
          next.delete("page")
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  const setPage = useCallback(
    (nextPage) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (nextPage <= 1) next.delete("page")
          else next.set("page", String(nextPage))
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  const apiQuery = useMemo(
    () => ({
      page,
      limit: pageSize,
      ...(sortKey !== "date-desc" ? { sort: sortKey } : {}),
      ...(deliveryStatus !== "all" ? { deliveryStatus } : {}),
    }),
    [page, pageSize, sortKey, deliveryStatus]
  )

  const { data, isLoading, isError, error } = useOrders(apiQuery)

  const pagination = data?.pagination ?? null

  const items = useMemo(() => {
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

  const sortLabel =
    sortCollection.items.find((i) => i.value === sortKey)?.label ?? "Date: newest → oldest"
  const statusLabel =
    deliveryStatusCollection.items.find((i) => i.value === deliveryStatus)?.label ?? "All"

  const isDefaultFilters = sortKey === "date-desc" && deliveryStatus === "all"

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
      <Stack mb={6} gap={4}>
        <Stack gap={1}>
          <Text fontSize="2xl" fontWeight="800">
            My Orders
          </Text>
          <Text fontSize="sm" color="gray.500">
            View active and past orders
          </Text>
        </Stack>

        <Stack
          direction={{ base: "column", sm: "row" }}
          gap={4}
          align={{ base: "stretch", sm: "flex-end" }}
          flexWrap="wrap"
        >
          <Stack gap={1} flex="1" minW={{ base: "100%", sm: "200px" }} maxW={{ md: "280px" }}>
            <Text fontSize="xs" fontWeight="700" color="gray.600">
              Sort by
            </Text>
            <Select.Root
              collection={sortCollection}
              size="sm"
              value={[sortKey]}
              onValueChange={(details) => setSortKey(details.value[0] ?? "date-desc")}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Sort" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {sortCollection.items.map((item) => (
                      <Select.Item item={item} key={item.value}>
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Stack>

          <Stack gap={1} flex="1" minW={{ base: "100%", sm: "200px" }} maxW={{ md: "240px" }}>
            <Text fontSize="xs" fontWeight="700" color="gray.600">
              Delivery status
            </Text>
            <Select.Root
              collection={deliveryStatusCollection}
              size="sm"
              value={[deliveryStatus]}
              onValueChange={(details) => setDeliveryStatus(details.value[0] ?? "all")}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Status" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {deliveryStatusCollection.items.map((item) => (
                      <Select.Item item={item} key={item.value}>
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Stack>
        </Stack>

        <HStack gap={2} flexWrap="wrap" fontSize="xs" color="gray.600">
          <Text fontWeight="600" color="gray.700">
            Active:
          </Text>
          <Text>{sortLabel}</Text>
          <Text>·</Text>
          <Text>Status: {statusLabel}</Text>
          {page > 1 ? (
            <>
              <Text>·</Text>
              <Text>Page {page}</Text>
            </>
          ) : null}
        </HStack>

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
                <EmptyState.Title>
                  {isDefaultFilters ? "You have no orders" : "No orders match your filters"}
                </EmptyState.Title>
                <EmptyState.Description>
                  {isDefaultFilters
                    ? "Explore our products and place an order."
                    : "Try changing delivery status or sort, or browse the catalog."}
                </EmptyState.Description>
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
