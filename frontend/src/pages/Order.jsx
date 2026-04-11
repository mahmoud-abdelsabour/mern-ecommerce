import { Badge, Box, Button, EmptyState, Flex, Separator, HStack, Stack, Text, Timeline, VStack } from "@chakra-ui/react"
import { FaClock } from "react-icons/fa"
import { MdCancel, MdLocalShipping, MdOutlineDoneOutline } from "react-icons/md"
import { RiRefund2Line } from "react-icons/ri"
import { GrReturn } from "react-icons/gr"
import { LuCheck, LuPackage, LuShip } from "react-icons/lu"
import { GoListUnordered } from "react-icons/go"
import { Link as RouterLink, useParams } from "react-router-dom"
import { useState } from "react"
import ProductList from "../components/ProductList"
import AddressCard from "../components/AddressCard"
import GlobalNotification from "../components/GlobalNotification"
import { useCancelOrder, useOrderById } from "../hooks/useOrders"
import { getToken } from "../APIs/http"
import { consumeFlash } from "../utils/flashStorage"

const formatMoney = (value) => `$${Number(value ?? 0).toFixed(2)}`
const formatDate = (value) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  })
}

const Order = () => {
  const token = getToken()
  const isLoggedIn = Boolean(token)

  const { orderId } = useParams()

  const { data: order, isLoading, isError, error } = useOrderById(orderId)

  const cancelMutation = useCancelOrder()

  const [checkoutFlash] = useState(() => consumeFlash())

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
              <EmptyState.Description>Login to view your order details.</EmptyState.Description>
              <Button as={RouterLink} to="/login">
                Go to Login
              </Button>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      </Flex>
    )
  }

  if (!orderId) {
    return (
      <Flex minH="70vh" align="center" justify="center" px={4}>
        <EmptyState.Root size={"lg"}>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <GoListUnordered />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>Missing order id</EmptyState.Title>
              <EmptyState.Description>Open an order from your orders list.</EmptyState.Description>
              <Button as={RouterLink} to="/orders">
                Go to Orders
              </Button>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      </Flex>
    )
  }

  if (isLoading) {
    return (
      <Flex minH="50vh" align="center" justify="center" px={4}>
        <Text color="gray.500">Loading order...</Text>
      </Flex>
    )
  }

  if (isError) {
    return (
      <Flex minH="70vh" align="center" justify="center" px={4}>
        <EmptyState.Root size={"lg"}>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <GoListUnordered />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>Couldn&apos;t load order</EmptyState.Title>
              <EmptyState.Description>
                {error?.response?.data?.message ?? error?.message ?? "Unknown error"}
              </EmptyState.Description>
              <Button as={RouterLink} to="/orders">
                Back to Orders
              </Button>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      </Flex>
    )
  }

  const items = (order?.products ?? []).map((p, index) => ({
    id: p?.product ?? `${index}`,
    title: p?.name,
    price: p?.priceAtPurchase,
    quantity: p?.quantity,
    brand: p?.brand,
    category: p?.category,
    image: p?.photos?.[0],
  }))

  const subtotal = (order?.products ?? []).reduce(
    (sum, p) => sum + Number(p?.priceAtPurchase ?? 0) * Number(p?.quantity ?? 1),
    0
  )

  // Current backend order model returns `totalPrice` (products subtotal).
  // Shipping/COD are not modeled yet, so we show them as 0 for now.
  const shippingPrice = 0
  const codFees = 0
  const total = Number(order?.totalPrice ?? subtotal) + shippingPrice + codFees

  const canCancel = String(order?.deliveryStatus ?? "").toLowerCase() === "pending"
  const canReturn = String(order?.deliveryStatus ?? "").toLowerCase() === "delivered"

  const onCancelOrder = () => {
    if (!canCancel) return
    const id = order?.id ?? order?._id
    if (!id) return
    cancelMutation.mutate(id)
  }

  const orderRouteId = order?.id ?? order?._id

  return (
    <Box maxW="1200px" mx="auto" px={4} py={8}>
      <Stack gap={6}>
        <GlobalNotification
          status={checkoutFlash?.status ?? "info"}
          title={checkoutFlash?.title}
        />
        <Stack gap={1}>
          <Text fontSize="2xl" fontWeight="900">
            Order
          </Text>
          <Text fontSize="sm" color="gray.500">
            {order?.id ?? order?._id ?? "—"}
          </Text>
        </Stack>

        <Stack gap={3}>
          <Text fontSize="lg" fontWeight="800">
            Products
          </Text>
          <ProductList items={items} variant="order" />
        </Stack>

        <Stack gap={4}>
          <OrderTimelineCard
            createdAt={order?.createdAt}
            shippedAt={order?.shippedAt}
            deliveredAt={order?.deliveredAt}
            deliveryStatus={order?.deliveryStatus ?? "pending"}
          />
          <AddressCard shippingInfo={order?.shippingInfo} />
          <ReceiptCard
            items={items}
            shippingPrice={shippingPrice}
            codFees={codFees}
            subtotal={subtotal}
            total={total}
            paymentMethod="COD"
          />
        </Stack>

        <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={4}>
          <Stack gap={2}>
            <HStack>
              <Button
                flex="1"
                colorScheme="red"
                disabled={!canCancel || cancelMutation.isPending}
                onClick={onCancelOrder}
              >
                Cancel Order
              </Button>
              <Button
                flex="1"
                as={RouterLink}
                to={orderRouteId ? `/order/${orderRouteId}/return` : "#"}
                colorPalette="orange"
                disabled={!canReturn || !orderRouteId}
                pointerEvents={!canReturn || !orderRouteId ? "none" : "auto"}
              >
                Return
              </Button>
            </HStack>
            {!canCancel && !canReturn && (
              <Text fontSize="xs" color="gray.500">
                Cancel works only when pending, return works only when delivered.
              </Text>
            )}
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}

export default Order

const OrderTimelineCard = ({ createdAt, shippedAt, deliveredAt, deliveryStatus }) => {
  const status = String(deliveryStatus ?? "").toLowerCase()
  const isCancelled = status === "cancelled"
  // Refunds/returns only happen after the customer received the order; show as delivered in the timeline.
  const impliesDelivered =
    status === "delivered" ||
    status === "refunded" ||
    status === "returned" ||
    status === "return requested"

  const confirmedDate = formatDate(createdAt)
  const shippedDate = formatDate(shippedAt)
  const deliveredDate = formatDate(deliveredAt)

  return (
    <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={4}>
      <Stack gap={2}>
        <HStack justify="space-between" align="center" flexWrap="wrap">
          <Text fontSize="lg" fontWeight="800">
            Delivery Timeline
          </Text>
          <StatusBadge status={deliveryStatus} />
        </HStack>
        <Separator />

        <Timeline.Root maxW="400px">
          <Timeline.Item>
            <Timeline.Connector>
              <Timeline.Separator />
              <Timeline.Indicator>
                <LuCheck />
              </Timeline.Indicator>
            </Timeline.Connector>
            <Timeline.Content>
              <Timeline.Title textStyle="sm">Order Confirmed</Timeline.Title>
              <Timeline.Description>{confirmedDate}</Timeline.Description>
              <Text textStyle="sm">We received your order and started processing it.</Text>
            </Timeline.Content>
          </Timeline.Item>

          <Timeline.Item>
            <Timeline.Connector>
              <Timeline.Separator />
              <Timeline.Indicator>
                <LuShip />
              </Timeline.Indicator>
            </Timeline.Connector>
            <Timeline.Content>
              <Timeline.Title textStyle="sm">Product Shipped</Timeline.Title>
              <Timeline.Description>{shippedDate}</Timeline.Description>
              <Text textStyle="sm">
                {status === "pending" || isCancelled
                  ? "Waiting for shipment."
                  : "Your order is on the way."}
              </Text>
            </Timeline.Content>
          </Timeline.Item>

          <Timeline.Item>
            <Timeline.Connector>
              <Timeline.Separator />
              <Timeline.Indicator>
                <LuPackage />
              </Timeline.Indicator>
            </Timeline.Connector>
            <Timeline.Content>
              <Timeline.Title textStyle="sm">Order Delivered</Timeline.Title>
              <Timeline.Description>{deliveredDate}</Timeline.Description>
              <Text textStyle="sm">
                {impliesDelivered ? "Delivered successfully." : "Not delivered yet."}
              </Text>
            </Timeline.Content>
          </Timeline.Item>
        </Timeline.Root>
      </Stack>
    </Box>
  )
}

const ReceiptCard = ({ items, shippingPrice, codFees, subtotal, total, paymentMethod }) => {
  return (
    <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={4}>
      <Stack gap={2}>
        <Text fontSize="lg" fontWeight="800">
          Receipt
        </Text>
        <Separator />

        <Stack gap={2}>
          {items.map((item) => {
            const qty = Number(item?.quantity ?? 1)
            const price = Number(item?.price ?? 0)
            const lineTotal = qty * price
            return (
              <HStack key={item.id} align="start">
                <Stack gap={0} minW="0">
                  <Text fontSize="sm" fontWeight="700" noOfLines={2}>
                    {item?.title ?? "Product"}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {qty} x {formatMoney(price)}
                  </Text>
                </Stack>
                <Box
                  flex="1"
                  borderBottomWidth="1px"
                  borderBottomStyle="dotted"
                  borderBottomColor="gray.300"
                  mx={3}
                  mt={3}
                />
                <Text fontSize="sm" fontWeight="800">
                  {formatMoney(lineTotal)}
                </Text>
              </HStack>
            )
          })}
        </Stack>

        <Separator />

        <Stack gap={1}>
          <HStack>
            <Text fontSize="sm" color="gray.600">
              Subtotal
            </Text>
            <Box
              flex="1"
              borderBottomWidth="1px"
              borderBottomStyle="dotted"
              borderBottomColor="gray.300"
              mx={3}
              mt={2}
            />
            <Text fontSize="sm" fontWeight="800">
              {formatMoney(subtotal)}
            </Text>
          </HStack>
          <HStack>
            <Text fontSize="sm" color="gray.600">
              Shipping
            </Text>
            <Box
              flex="1"
              borderBottomWidth="1px"
              borderBottomStyle="dotted"
              borderBottomColor="gray.300"
              mx={3}
              mt={2}
            />
            <Text fontSize="sm" fontWeight="800">
              {formatMoney(shippingPrice)}
            </Text>
          </HStack>
          <HStack>
            <Text fontSize="sm" color="gray.600">
              COD fees
            </Text>
            <Box
              flex="1"
              borderBottomWidth="1px"
              borderBottomStyle="dotted"
              borderBottomColor="gray.300"
              mx={3}
              mt={2}
            />
            <Text fontSize="sm" fontWeight="800">
              {formatMoney(codFees)}
            </Text>
          </HStack>
        </Stack>

        <Separator />

        <HStack>
          <Text fontSize="md" fontWeight="900">
            Total
          </Text>
          <Box
            flex="1"
            borderBottomWidth="2px"
            borderBottomStyle="dotted"
            borderBottomColor="gray.400"
            mx={3}
            mt={3}
          />
          <Text fontSize="md" fontWeight="900">
            {formatMoney(total)}
          </Text>
        </HStack>

        <Separator />

        <HStack>
          <Text fontSize="sm" color="gray.600">
            Payment method
          </Text>
          <Box
            flex="1"
            borderBottomWidth="1px"
            borderBottomStyle="dotted"
            borderBottomColor="gray.300"
            mx={3}
            mt={2}
          />
          <Text fontSize="sm" fontWeight="800">
            {paymentMethod}
          </Text>
        </HStack>
      </Stack>
    </Box>
  )
}

const StatusBadge = ({ status }) => {
  const normalized = String(status).toLowerCase()

  const config = {
    pending: { icon: <FaClock />, color: "yellow" },
    shipped: { icon: <MdLocalShipping />, color: "blue" },
    delivered: { icon: <MdOutlineDoneOutline />, color: "green" },
    cancelled: { icon: <MdCancel />, color: "red" },
    "return requested": { icon: <GrReturn />, color: "orange" },
    returned: { icon: <GrReturn />, color: "orange" },
    refunded: { icon: <RiRefund2Line />, color: "purple" },
  }

  const { icon, color } = config[normalized] || { icon: <FaClock />, color: "gray" }

  return (
    <Badge variant="solid" colorPalette={color}>
      <HStack gap={1}>
        {icon}
        <Text fontSize="xs" fontWeight="600" textTransform="capitalize">
          {status}
        </Text>
      </HStack>
    </Badge>
  )
}
