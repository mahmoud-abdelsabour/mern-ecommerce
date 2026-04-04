import {
  Box,
  Button,
  HStack,
  IconButton,
  Portal,
  RadioGroup,
  Select,
  Separator,
  Stack,
  Text,
  createListCollection,
} from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { LuPlus } from "react-icons/lu"
import ProductList from "../components/ProductList"
import AddressForm from "../components/AddressForm"

const formatMoney = (value) => `$${Number(value ?? 0).toFixed(2)}`

const initialItems = [
  {
    id: "p-1",
    title: "Wireless Headphones",
    price: 129,
    quantity: 1,
    brand: "Nimbus",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
  },
  {
    id: "p-2",
    title: "Smart Watch",
    price: 199,
    quantity: 2,
    brand: "Vertex",
    category: "Wearables",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
  },
  {
    id: "p-3",
    title: "Running Shoes",
    price: 89,
    quantity: 1,
    brand: "Atlas",
    category: "Footwear",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  },
]

const CheckOut = () => {
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
    return initialItems.reduce(
      (sum, item) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 1),
      0
    )
  }, [])

  const shippingPrice = 25
  const codFees = paymentMethod === "COD" ? 10 : 0
  const total = subtotal + shippingPrice + codFees

  const canCheckout = Boolean(paymentMethod) && Boolean(selectedAddressId) && hasSavedAddresses

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
          <ProductList items={initialItems} variant="order" />
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
          items={initialItems}
          subtotal={subtotal}
          shippingPrice={shippingPrice}
          codFees={codFees}
          total={total}
          paymentMethod={paymentMethod || "—"}
        />

        <Button size="lg" colorScheme="teal" disabled={!canCheckout}>
          Checkout
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
