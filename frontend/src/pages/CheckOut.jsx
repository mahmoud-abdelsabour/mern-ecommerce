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
  Skeleton,
  SkeletonText,
  Stack,
  Text,
  VStack,
  createListCollection,
} from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { LuPlus, LuShoppingCart } from "react-icons/lu"
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom"
import ProductList from "../components/ProductList"
import AddressForm from "../components/AddressForm"
import GlobalNotification from "../components/GlobalNotification"
import { useCart } from "../hooks/useCart"
import { getToken } from "../APIs/http"
import { useCreateOrder } from "../hooks/useOrders"
import { useProductById } from "../hooks/useProducts"
import { useCreateAddress, useMe } from "../hooks/useUser"
import { setFlash } from "../utils/flashStorage"
import { notify } from "../utils/notify"
import ProductGridSkeleton from "../components/skeletons/ProductGridSkeleton"

const formatMoney = (value) => `$${Number(value ?? 0).toFixed(2)}`

const CheckOut = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const token = getToken()
  const isLoggedIn = Boolean(token)

  // Optional "buy now" flow: checkout with a single product instead of the whole cart.
  const buyNowProductId = searchParams.get("buyNow") || ""
  const isBuyNow = Boolean(buyNowProductId)

  const {
    data: cartData,
    isLoading: isCartLoading,
    isError: isCartError,
    error: cartError,
  } = useCart()
  const cart = useMemo(() => cartData ?? [], [cartData])

  const {
    data: buyNowData,
    isLoading: isBuyNowLoading,
    isError: isBuyNowError,
    error: buyNowError,
  } = useProductById(buyNowProductId, { enabled: isLoggedIn && isBuyNow })

  const buyNowProduct = buyNowData?.product ?? null

  // Map cart items into the shared ProductCard/ProductList shape.
  const items = useMemo(() => {
    // Buy-now checkout: render a single product line (qty defaults to 1).
    if (isBuyNow) {
      if (!buyNowProduct) return []
      return [
        {
          id: buyNowProduct?.id ?? buyNowProduct?._id ?? buyNowProductId,
          title: buyNowProduct?.name ?? "Product",
          price: buyNowProduct?.price ?? 0,
          rating: buyNowProduct?.rating?.score ?? 0,
          brand: buyNowProduct?.brand?.name ?? "—",
          category: buyNowProduct?.category?.name ?? "—",
          image: buyNowProduct?.photos?.[0],
          quantity: 1,
        },
      ]
    }

    return cart.map((item) => {
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
  }, [buyNowProduct, buyNowProductId, cart, isBuyNow])

  const createOrderMutation = useCreateOrder({
    onSuccess: (createdOrder) => {
      const id = createdOrder?.id ?? createdOrder?._id
      if (id) {
        notify.success("Order placed", "Redirecting to your order confirmation.")
        setFlash({
          status: "success",
          title: "Order placed successfully.",
        })
        navigate(`/order/${id}`, { replace: true })
      }
    },
  })

  const { data: me, isLoading: isMeLoading } = useMe()

  const [paymentMethod, setPaymentMethod] = useState("")

  const [notice, setNotice] = useState(null)
  const showNotice = (status, title) => setNotice({ id: Date.now(), status, title })

  const addresses = useMemo(() => (Array.isArray(me?.addresses) ? me.addresses : []), [me])

  const hasSavedAddresses = addresses.length > 0

  const [selectedAddressId, setSelectedAddressId] = useState("")

  const [showAddressForm, setShowAddressForm] = useState(false)

  const mustShowAddressForm = !isMeLoading && !hasSavedAddresses
  const resolvedSelectedAddressId =
    selectedAddressId || (hasSavedAddresses ? String(addresses[0]?._id ?? addresses[0]?.id ?? "") : "")

  const [addressDraft, setAddressDraft] = useState({
    address_name: "",
    country: "",
    city: "",
    postalcode: "",
    street: "",
    building: "",
    floor: "",
    special_mark: "",
  })

  const selectedAddress = useMemo(
    () => addresses.find((a) => String(a._id ?? a.id) === resolvedSelectedAddressId) ?? null,
    [addresses, resolvedSelectedAddressId]
  )

  const addressCollection = useMemo(() => {
    return createListCollection({
      items: addresses.map((a) => ({
        label: (a?.address_name ?? "").trim() ? a.address_name : "Unnamed address",
        value: String(a._id ?? a.id),
      })),
    })
  }, [addresses])

  const createAddressMutation = useCreateAddress({
    onSuccess: (data) => {
      showNotice("success", data?.message ?? "Address added successfully.")
      setShowAddressForm(false)
      setAddressDraft({
        address_name: "",
        country: "",
        city: "",
        postalcode: "",
        street: "",
        building: "",
        floor: "",
        special_mark: "",
      })
      const list = data?.addresses
      if (Array.isArray(list) && list.length > 0) {
        // New address is appended last by the server.
        const last = list[list.length - 1]
        const id = last?._id ?? last?.id
        if (id) setSelectedAddressId(String(id))
      }
    },
  })

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 1),
      0
    )
  }, [items])

  const shippingPrice = 25
  const codFees = paymentMethod === "COD" ? 10 : 0
  const total = subtotal + shippingPrice + codFees

  const hasValidSelection =
    Boolean(resolvedSelectedAddressId) &&
    addresses.some((a) => String(a._id ?? a.id) === resolvedSelectedAddressId)

  const canCheckout =
    items.length > 0 &&
    Boolean(paymentMethod) &&
    hasValidSelection &&
    Boolean(me?.firstName && me?.lastName && me?.phone)

  const onSaveAddress = () => {
    const required = [
      "address_name",
      "country",
      "city",
      "postalcode",
      "street",
      "building",
      "floor",
    ]
    const missing = required.some((key) => String(addressDraft[key] ?? "").trim() === "")
    if (missing) return

    const payload = {
      address_name: String(addressDraft.address_name ?? "").trim(),
      country: String(addressDraft.country ?? "").trim(),
      city: String(addressDraft.city ?? "").trim(),
      postalcode: String(addressDraft.postalcode ?? "").trim(),
      street: String(addressDraft.street ?? "").trim(),
      building: String(addressDraft.building ?? "").trim(),
      floor: Number(addressDraft.floor),
      special_mark: String(addressDraft.special_mark ?? "").trim(),
    }

    createAddressMutation.mutate(payload)
  }

  const updateAddressDraft = (patch) => setAddressDraft((prev) => ({ ...prev, ...patch }))

  const onPlaceOrder = () => {
    if (!selectedAddress || !me) return

    // Backend expects `{ products: [{ product, quantity }], shippingInfo, paymentMethod }`.
    // Contact fields come from the authenticated user; delivery lines from the saved address.
    const products = items.map((i) => ({
      product: i.id,
      quantity: Number(i.quantity ?? 1),
    }))

    const shippingInfo = {
      firstName: me.firstName,
      lastName: me.lastName,
      phone: me.phone,
      address: {
        country: selectedAddress.country,
        city: selectedAddress.city,
        postalcode: selectedAddress.postalcode,
        street: selectedAddress.street,
        building: selectedAddress.building,
        floor: Number(selectedAddress.floor),
        special_mark: selectedAddress.special_mark ?? "",
      },
    }

    const source = isBuyNow ? "buyNow" : "cart"
    createOrderMutation.mutate({ products, shippingInfo, source, paymentMethod })
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
              <EmptyState.Description>Login to checkout.</EmptyState.Description>
              <Button as={RouterLink} to="/login">
                Go to Login
              </Button>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      </Flex>
    )
  }

  if ((isBuyNow ? isBuyNowLoading : isCartLoading) || isMeLoading) {
    return (
      <Box maxW="1200px" mx="auto" px={4} py={8}>
        <Stack gap={6}>
          <Stack gap={2}>
            <Skeleton h="28px" w="160px" />
            <Skeleton h="12px" w="520px" maxW="90%" />
          </Stack>

          <Stack gap={3}>
            <Skeleton h="18px" w="120px" />
            <ProductGridSkeleton count={4} variant="order" />
          </Stack>

          <Box borderWidth="1px" borderColor="surface.border" rounded="lg" p={4} bg="surface.panel">
            <Stack gap={3}>
              <Skeleton h="18px" w="200px" />
              <SkeletonText noOfLines={3} />
              <Skeleton h="40px" w="100%" rounded="md" />
            </Stack>
          </Box>

          <Box borderWidth="1px" borderColor="surface.border" rounded="lg" p={4} bg="surface.panel">
            <Stack gap={3}>
              <Skeleton h="18px" w="160px" />
              <Skeleton h="36px" w="60%" rounded="md" />
              <Skeleton h="36px" w="60%" rounded="md" />
              <Separator />
              <Skeleton h="14px" w="55%" />
              <Skeleton h="14px" w="65%" />
              <Skeleton h="14px" w="45%" />
              <Skeleton h="44px" w="100%" rounded="md" />
            </Stack>
          </Box>
        </Stack>
      </Box>
    )
  }

  if (isBuyNow ? isBuyNowError : isCartError) {
    return (
      <Flex minH="70vh" align="center" justify="center" px={4}>
        <EmptyState.Root size={"lg"}>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <LuShoppingCart />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>
                {isBuyNow ? "Couldn't load this product" : "Couldn't load your cart"}
              </EmptyState.Title>
              <EmptyState.Description>
                {isBuyNow
                  ? buyNowError?.response?.data?.message ?? buyNowError?.message ?? "Unknown error"
                  : cartError?.response?.data?.message ?? cartError?.message ?? "Unknown error"}
              </EmptyState.Description>
              <Button as={RouterLink} to={isBuyNow ? "/catalog" : "/cart"}>
                {isBuyNow ? "Back to catalog" : "Back to cart"}
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
              <EmptyState.Title>
                {isBuyNow ? "This product is unavailable" : "Your cart is empty"}
              </EmptyState.Title>
              <EmptyState.Description>
                {isBuyNow
                  ? "Try choosing another product."
                  : "Add products to your cart before checkout."}
              </EmptyState.Description>
              <Button as={RouterLink} to="/catalog">
                Start Shopping
              </Button>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      </Flex>
    )
  }

  const addressFormBusy = createAddressMutation.isPending

  return (
    <Box maxW="1280px" mx="auto" px={{ base: 4, lg: 6 }} py={{ base: 8, lg: 10 }}>
      <Stack gap={6}>
        <GlobalNotification
          key={notice?.id}
          status={notice?.status ?? "info"}
          title={notice?.title}
        />

        <Stack gap={1}>
          <Text fontSize="2xl" fontWeight="900">
            Checkout
          </Text>
          <Text fontSize="sm" color="text.secondary">
            Choose payment, delivery address, and confirm your order.
          </Text>
        </Stack>

        <Stack gap={3}>
          <Text fontSize="lg" fontWeight="800">
            Products
          </Text>
          <ProductList items={items} variant="order" />
        </Stack>

        <Box borderWidth="1px" borderColor="surface.border" bg="surface.panel" rounded="lg" p={4}>
          <Stack gap={3}>
            <Text fontSize="lg" fontWeight="800">
              Payment
            </Text>
            <Separator />

            <RadioGroup.Root
              variant="outline"
              colorPalette="brand"
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

        <Box borderWidth="1px" borderColor="surface.border" bg="surface.panel" rounded="lg" p={4}>
          <Stack gap={3}>
            <HStack justify="space-between" align="center" flexWrap="wrap">
              <Text fontSize="lg" fontWeight="800">
                Deliver to
              </Text>
              <HStack w={{ base: "100%", sm: "auto" }} flexWrap="wrap" justify={{ base: "flex-start", sm: "flex-end" }}>
                <Select.Root
                  collection={addressCollection}
                  size="sm"
                  w={{ base: "100%", sm: "360px" }}
                  disabled={!hasSavedAddresses}
                  value={hasSavedAddresses && resolvedSelectedAddressId ? [resolvedSelectedAddressId] : []}
                  onValueChange={(details) => setSelectedAddressId(details.value[0] ?? "")}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText
                        placeholder={hasSavedAddresses ? "Select address" : "[NONE]"}
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
                  colorPalette="neutral"
                  alignSelf={{ base: "flex-end", sm: "center" }}
                  onClick={() => setShowAddressForm((v) => !v)}
                  disabled={addressFormBusy}
                >
                  <LuPlus />
                </IconButton>
              </HStack>
            </HStack>

            <Separator />

            {selectedAddress && (
              <Text fontSize="sm" color="text.secondary">
                {me?.firstName} {me?.lastName} • {me?.phone} • {selectedAddress.address_name} •{" "}
                {selectedAddress.country}, {selectedAddress.city}, {selectedAddress.street}{" "}
                {selectedAddress.building}, floor {selectedAddress.floor}
              </Text>
            )}

            {(showAddressForm || mustShowAddressForm) && (
              <Stack gap={2}>
                <AddressForm
                  title="Add New Address"
                  draft={addressDraft}
                  onChange={updateAddressDraft}
                  onSubmit={onSaveAddress}
                  submitLabel="Save address"
                  onCancel={hasSavedAddresses ? () => setShowAddressForm(false) : undefined}
                  disabled={addressFormBusy}
                />
                {!hasSavedAddresses && (
                  <Text fontSize="xs" color="text.muted">
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

        <Button
          size="lg"
          colorPalette="brand"
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
    <Box borderWidth="1px" borderColor="surface.border" bg="surface.panel" rounded="lg" p={4}>
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
                  <Text fontSize="xs" color="text.secondary">
                    {qty} x {formatMoney(price)}
                  </Text>
                </Stack>
                <Box
                  flex="1"
                  borderBottomWidth="1px"
                  borderBottomStyle="dotted"
                  borderBottomColor="neutral.300"
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
            borderBottomColor="neutral.400"
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
          <Text fontSize="sm" color="text.secondary">
      {label}
    </Text>
    <Box
      flex="1"
      borderBottomWidth="1px"
      borderBottomStyle="dotted"
      borderBottomColor="neutral.300"
      mx={3}
      mt={2}
    />
    <Text fontSize="sm" fontWeight="800">
      {value}
    </Text>
  </HStack>
)
