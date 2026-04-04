import { Badge, Box, Separator, HStack, Stack, Text, Button, Timeline } from "@chakra-ui/react"
import { useState } from "react"
import { FaClock } from "react-icons/fa"
import { MdCancel, MdLocalShipping, MdOutlineDoneOutline } from "react-icons/md"
import { RiRefund2Line } from "react-icons/ri"
import { GrReturn } from "react-icons/gr"
import { LuCheck, LuPackage, LuShip } from "react-icons/lu"
import ProductList from "../components/ProductList"
import AddressCard from "../components/AddressCard"

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

const initialOrder = {
  id: "ORD-10021",
  createdAt: "2026-04-04T10:30:00.000Z",
  paymentMethod: "COD",
  deliveryStatus: "shipped",
  shippedAt: null,
  deliveredAt: null,
  shippingPrice: 25,
  codFees: 10,
  shippingInfo: {
    firstName: "Mahmoud",
    lastName: "Ahmed",
    phone: "+20 100 000 0000",
    address: {
      country: "Egypt",
      city: "Cairo",
      postalcode: "11311",
      street: "Tahrir St.",
      building: "12B",
      floor: 3,
      special_mark: "Near the metro station",
    },
  },
  products: [
    {
      product: "p-1",
      quantity: 1,
      priceAtPurchase: 129,
      name: "Wireless Headphones",
      description: "High-quality wireless headphones",
      photos: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"],
      brand: "Nimbus",
      category: "Electronics",
    },
    {
      product: "p-2",
      quantity: 2,
      priceAtPurchase: 199,
      name: "Smart Watch",
      description: "Smart watch with fitness tracking",
      photos: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"],
      brand: "Vertex",
      category: "Wearables",
    },
    {
      product: "p-3",
      quantity: 1,
      priceAtPurchase: 89,
      name: "Running Shoes",
      description: "Lightweight running shoes",
      photos: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"],
      brand: "Atlas",
      category: "Footwear",
    },
  ],
}

const Order = () => {
  const [order, setOrder] = useState(initialOrder)

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

  const shippingPrice = Number(order?.shippingPrice ?? 0)
  const codFees = Number(order?.codFees ?? 0)
  const total = subtotal + shippingPrice + codFees

  const canCancel = String(order?.deliveryStatus ?? "").toLowerCase() === "pending"
  const canReturn = String(order?.deliveryStatus ?? "").toLowerCase() === "delivered"

  const onCancelOrder = () => {
    if (!canCancel) return
    setOrder((prev) => ({ ...prev, deliveryStatus: "cancelled" }))
  }

  const onReturnOrder = () => {
    if (!canReturn) return
    setOrder((prev) => ({ ...prev, deliveryStatus: "return requested" }))
  }

  return (
    <Box maxW="1200px" mx="auto" px={4} py={8}>
      <Stack gap={6}>
        <Stack gap={1}>
          <Text fontSize="2xl" fontWeight="900">
            Order
          </Text>
          <Text fontSize="sm" color="gray.500">
            {order?.id ?? "—"}
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
            paymentMethod={order?.paymentMethod ?? "COD"}
          />
        </Stack>

        <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={4}>
          <Stack gap={2}>
            <HStack>
              <Button flex="1" colorScheme="red" disabled={!canCancel} onClick={onCancelOrder}>
                Cancel Order
              </Button>
              <Button flex="1" colorScheme="orange" disabled={!canReturn} onClick={onReturnOrder}>
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
                {status === "delivered" ? "Delivered successfully." : "Not delivered yet."}
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
