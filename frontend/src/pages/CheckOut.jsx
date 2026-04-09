import {
  Box,
  Button,
  EmptyState,
  Flex,
  HStack,
  IconButton,
  Portal,
  RadioGroup,
  Select,
  Separator,
  Stack,
  Text,
  VStack,
  createListCollection,
} from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { LuPlus, LuShoppingCart } from "react-icons/lu"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import ProductList from "../components/ProductList"
import AddressForm from "../components/AddressForm"
import { useCart } from "../hooks/useCart"
import { getToken } from "../APIs/http"
import { useCreateOrder } from "../hooks/useOrders"

const formatMoney = (value) => `$${Number(value ?? 0).toFixed(2)}`

const CheckOut = () => {
  const navigate = useNavigate()

  const token = getToken()
  const isLoggedIn = Boolean(token)

  const {
    data: cartData,
    isLoading: isCartLoading,
    isError: isCartError,
    error: cartError,
  } = useCart()
  const cart = useMemo(() => cartData ?? [], [cartData])

  // Map cart items into the shared ProductCard/ProductList shape.
  const items = useMemo(() => {
    return cart.map((item) => {
      const product = item?.product
      return {
        id: product?.id ?? product?._id ?? item?.product,
        title: product?.name ?? "Product",
        price: product?.price ?? 0,
        rating: product?.rating?.score ?? 0,
        brand: "â€”",
        category: "â€”",
        image: product?.photos?.[0],
        quantity: item?.quantity ?? 1,
      }
    })
  }, [cart])

  const createOrderMutation = useCreateOrder({
    onSuccess: (createdOrder) => {
      const id = createdOrder?.id ?? createdOrder?._id
      if (id) navigate(`/order/${id}`, { replace: true })
    },
  })

  const [paymentMethod, setPaymentMethod] = useState("")

  const [savedAddresses, setSavedAddresses] = useState([
    {
      id: "addr-1",
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
  ])

  const hasSavedAddresses = savedAddresses.length > 0

  const [selectedAddressId, setSelectedAddressId] = useState(
    hasSavedAddresses ? savedAddresses[0].id : ""
  )

  const [showAddressForm, setShowAddressForm] = useState(!hasSavedAddresses)
  const [addressDraft, setAddressDraft] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    country: "",
    city: "",
    postalcode: "",
    street: "",
    building: "",
    floor: "",
    special_mark: "",
  })

  const selectedAddress = useMemo(() => {
    return savedAddresses.find((a) => a.id === selectedAddressId) ?? null
  }, [savedAddresses, selectedAddressId])

  const addressCollection = useMemo(() => {
    return createListCollection({
      items: savedAddresses.map((a) => ({
        label: `${a.address.city} • ${a.address.street} • ${a.address.building}`,
        value: a.id,
      })),
    })
  }, [savedAddresses])

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 1),
      0
    )
  }, [items])

  const shippingPrice = 25
  const codFees = paymentMethod === "COD" ? 10 : 0
  const total = subtotal + shippingPrice + codFees

  const canCheckout =
    items.length > 0 && Boolean(paymentMethod) && Boolean(selectedAddressId) && hasSavedAddresses

  const onSaveAddress = () => {
    const required = [
      "firstName",
      "lastName",
      "phone",
      "country",
      "city",
      "postalcode",
      "street",
      "building",
      "floor",
    ]
    const missing = required.some((key) => String(addressDraft[key] ?? "").trim() === "")
    if (missing) return

    const id = `addr-${Date.now()}`
    const newAddress = {
      id,
      firstName: addressDraft.firstName.trim(),
      lastName: addressDraft.lastName.trim(),
      phone: addressDraft.phone.trim(),
      address: {
        country: addressDraft.country.trim(),
        city: addressDraft.city.trim(),
        postalcode: addressDraft.postalcode.trim(),
        street: addressDraft.street.trim(),
        building: addressDraft.building.trim(),
        floor: Number(addressDraft.floor),
        special_mark: addressDraft.special_mark.trim(),
      },
    }

    setSavedAddresses((prev) => [...prev, newAddress])
    setSelectedAddressId(id)
    setShowAddressForm(false)
    setAddressDraft({
      firstName: "",
      lastName: "",
      phone: "",
      country: "",
      city: "",
      postalcode: "",
      street: "",
      building: "",
      floor: "",
      special_mark: "",
    })
  }

  const updateAddressDraft = (patch) => setAddressDraft((prev) => ({ ...prev, ...patch }))

  const onPlaceOrder = () => {
    if (!selectedAddress) return

    // Backend expects `{ products: [{ product, quantity }], shippingInfo }`.
    // We use the current cart snapshot so the order matches what the user sees.
    const products = items.map((i) => ({
      product: i.id,
      quantity: Number(i.quantity ?? 1),
    }))

    const shippingInfo = {
      firstName: selectedAddress.firstName,
      lastName: selectedAddress.lastName,
      phone: selectedAddress.phone,
      address: selectedAddress.address,
    }

    createOrderMutation.mutate({ products, shippingInfo })
  }

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
              <EmptyState.Description>Login to checkout your cart items.</EmptyState.Description>
              <Button as={RouterLink} to="/login">
                Go to Login
              </Button>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      </Flex>
    )
  }

  if (isCartLoading) {
    return (
      <Flex minH="50vh" align="center" justify="center" px={4}>
        <Text color="gray.500">Loading checkout...</Text>
      </Flex>
    )
  }

  if (isCartError) {
    return (
      <Flex minH="70vh" align="center" justify="center" px={4}>
        <EmptyState.Root size={"lg"}>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <LuShoppingCart />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>Couldn&apos;t load your cart</EmptyState.Title>
              <EmptyState.Description>
                {cartError?.response?.data?.message ?? cartError?.message ?? "Unknown error"}
              </EmptyState.Description>
              <Button as={RouterLink} to="/cart">
                Back to cart
              </Button>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      </Flex>
    )
  }

  if (items.length === 0) {
    return (
      <Flex minH="70vh" align="center" justify="center" px={4}>
        <EmptyState.Root size={"lg"}>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <LuShoppingCart />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>Your cart is empty</EmptyState.Title>
              <EmptyState.Description>Add products to your cart before checkout.</EmptyState.Description>
              <Button as={RouterLink} to="/catalog">
                Start Shopping
              </Button>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      </Flex>
    )
  }

  return (
    <Box maxW="1200px" mx="auto" px={4} py={8}>
      <Stack gap={6}>
        <Stack gap={1}>
          <Text fontSize="2xl" fontWeight="900">
            Checkout
          </Text>
          <Text fontSize="sm" color="gray.500">
            Choose payment, delivery address, and confirm your order.
          </Text>
        </Stack>

        <Stack gap={3}>
          <Text fontSize="lg" fontWeight="800">
            Products
          </Text>
          <ProductList items={items} variant="order" />
        </Stack>

        <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={4}>
          <Stack gap={3}>
            <Text fontSize="lg" fontWeight="800">
              Payment
            </Text>
            <Separator />

            <RadioGroup.Root
              variant="outline"
              colorPalette="teal"
              value={paymentMethod}
              onValueChange={(details) => setPaymentMethod(details.value)}
            >
              <HStack gap={4} flexWrap="wrap">
                <RadioGroup.Item value="COD" minW="140px">
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator />
                  <RadioGroup.ItemText>COD</RadioGroup.ItemText>
                </RadioGroup.Item>

                <RadioGroup.Item value="Credit" minW="140px" disabled>
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator />
                  <RadioGroup.ItemText>Credit (soon)</RadioGroup.ItemText>
                </RadioGroup.Item>
              </HStack>
            </RadioGroup.Root>
          </Stack>
        </Box>

        <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={4}>
          <Stack gap={3}>
            <HStack justify="space-between" align="center" flexWrap="wrap">
              <Text fontSize="lg" fontWeight="800">
                Deliver to
              </Text>
              <HStack>
                <Select.Root
                  collection={addressCollection}
                  size="sm"
                  w={{ base: "100%", sm: "360px" }}
                  disabled={!hasSavedAddresses}
                  value={selectedAddressId ? [selectedAddressId] : []}
                  onValueChange={(details) => setSelectedAddressId(details.value[0] ?? "")}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText
                        placeholder={hasSavedAddresses ? "Select address" : "No addresses"}
                      />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {addressCollection.items.map((address) => (
                          <Select.Item item={address} key={address.value}>
                            {address.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>

                <IconButton
                  aria-label="Add address"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddressForm((v) => !v)}
                >
                  <LuPlus />
                </IconButton>
              </HStack>
            </HStack>

            <Separator />

            {selectedAddress && (
              <Text fontSize="sm" color="gray.600">
                {selectedAddress.firstName} {selectedAddress.lastName} • {selectedAddress.phone} •{" "}
                {selectedAddress.address.country}, {selectedAddress.address.city},{" "}
                {selectedAddress.address.street} {selectedAddress.address.building}, floor{" "}
                {selectedAddress.address.floor}
              </Text>
            )}

            {showAddressForm && (
              <Stack gap={2}>
                <AddressForm
                  title="Add New Address"
                  draft={addressDraft}
                  onChange={updateAddressDraft}
                  onSubmit={onSaveAddress}
                  submitLabel="Save address"
                  onCancel={hasSavedAddresses ? () => setShowAddressForm(false) : undefined}
                />
                {!hasSavedAddresses && (
                  <Text fontSize="xs" color="gray.500">
                    Add at least one saved address to enable checkout.
                  </Text>
                )}
              </Stack>
            )}
          </Stack>
        </Box>

        <ReceiptSection
          items={items}
          subtotal={subtotal}
          shippingPrice={shippingPrice}
          codFees={codFees}
          total={total}
          paymentMethod={paymentMethod || "—"}
        />

        {createOrderMutation.isError && (
          <Text fontSize="sm" color="red.500">
            Failed to place order:{" "}
            {createOrderMutation.error?.response?.data?.message ??
              createOrderMutation.error?.message ??
              "Unknown error"}
          </Text>
        )}

        <Button
          size="lg"
          colorScheme="teal"
          disabled={!canCheckout || createOrderMutation.isPending}
          onClick={onPlaceOrder}
        >
          {createOrderMutation.isPending ? "Placing..." : "Place order"}
        </Button>
      </Stack>
    </Box>
  )
}

export default CheckOut

const ReceiptSection = ({ items, subtotal, shippingPrice, codFees, total, paymentMethod }) => {
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
          <LeaderRow label="Subtotal" value={formatMoney(subtotal)} />
          <LeaderRow label="Shipping" value={formatMoney(shippingPrice)} />
          <LeaderRow label="COD fees" value={formatMoney(codFees)} />
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

        <LeaderRow label="Payment method" value={paymentMethod} />
      </Stack>
    </Box>
  )
}

const LeaderRow = ({ label, value }) => (
  <HStack>
    <Text fontSize="sm" color="gray.600">
      {label}
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
      {value}
    </Text>
  </HStack>
)
