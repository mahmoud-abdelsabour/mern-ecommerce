import {
  Box,
  Button,
  CloseButton,
  Dialog,
  EmptyState,
  Flex,
  HStack,
  Portal,
  Separator,
  Stack,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react"
import { useEffect, useMemo, useState } from "react"
import { GoListUnordered } from "react-icons/go"
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom"
import ProductList from "../components/ProductList"
import { ProductCard } from "../components/ProductCard"
import { getToken } from "../APIs/http"
import { useOrderById, useRequestReturn } from "../hooks/useOrders"
import { setFlash } from "../utils/flashStorage"

const Return = () => {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const token = getToken()
  const isLoggedIn = Boolean(token)

  const { data: order, isLoading, isError, error } = useOrderById(orderId)

  const [items, setItems] = useState([])
  const [comments, setComments] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    const products = order?.products ?? []
    if (products.length === 0) {
      setItems([])
      return
    }
    setItems(
      products.map((p, index) => {
        const productId = String(p?.product ?? "")
        return {
          id: productId || `line-${index}`,
          productId,
          title: p?.name ?? "Product",
          price: p?.priceAtPurchase ?? 0,
          brand: typeof p?.brand === "string" ? p.brand : p?.brand?.name ?? "—",
          category: typeof p?.category === "string" ? p.category : p?.category?.name ?? "—",
          image: p?.photos?.[0],
          quantity: 1,
          maxQuantity: Math.max(1, Number(p?.quantity ?? 1)),
          selected: false,
        }
      })
    )
  }, [order])

  const hasSelected = useMemo(() => items.some((i) => i.selected), [items])

  const toggleSelected = (id, checked) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, selected: Boolean(checked) } : i)))
  }

  const increaseQty = (id) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i
        const maxQ = Number(i.maxQuantity ?? 1)
        const next = Math.min(maxQ, Number(i.quantity ?? 1) + 1)
        return { ...i, quantity: next }
      })
    )
  }

  const decreaseQty = (id) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i
        const next = Math.max(1, Number(i.quantity ?? 1) - 1)
        return { ...i, quantity: next }
      })
    )
  }

  const returnMutation = useRequestReturn({
    onSuccess: (data) => {
      setConfirmOpen(false)
      const msg = data?.message ?? "Return request submitted."
      setFlash({ status: "success", title: msg })
      navigate(`/order/${orderId}`, { replace: true })
    },
    onError: () => {
      // Keep dialog open; user can fix selection or retry.
    },
  })

  const submitReturn = () => {
    if (!orderId || !hasSelected) return

    const reason = String(comments ?? "").trim().slice(0, 300)
    const returnedItems = items
      .filter((i) => i.selected && i.productId)
      .map((i) => ({
        product: i.productId,
        quantity: Number(i.quantity ?? 1),
        reason,
      }))

    if (returnedItems.length === 0) return

    returnMutation.mutate({ orderId, returnedItems })
  }

  if (!isLoggedIn) {
    return (
      <Flex minH="70vh" align="center" justify="center" px={4}>
        <EmptyState.Root size="lg">
          <EmptyState.Content>
            <EmptyState.Indicator>
              <GoListUnordered />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>Login required</EmptyState.Title>
              <EmptyState.Description>Log in to request a return.</EmptyState.Description>
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
        <EmptyState.Root size="lg">
          <EmptyState.Content>
            <EmptyState.Title>Missing order</EmptyState.Title>
            <Button as={RouterLink} to="/orders">
              Back to orders
            </Button>
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
        <EmptyState.Root size="lg">
          <EmptyState.Content>
            <EmptyState.Title>Couldn&apos;t load order</EmptyState.Title>
            <EmptyState.Description>
              {error?.response?.data?.message ?? error?.message ?? "Unknown error"}
            </EmptyState.Description>
            <Button as={RouterLink} to="/orders">
              Back to orders
            </Button>
          </EmptyState.Content>
        </EmptyState.Root>
      </Flex>
    )
  }

  const status = String(order?.deliveryStatus ?? "").toLowerCase()
  if (status !== "delivered") {
    return (
      <Flex minH="70vh" align="center" justify="center" px={4}>
        <EmptyState.Root size="lg">
          <EmptyState.Content>
            <EmptyState.Title>Returns unavailable</EmptyState.Title>
            <EmptyState.Description>
              Returns can only be requested for delivered orders. Current status: {order?.deliveryStatus ?? "—"}
            </EmptyState.Description>
            <Button as={RouterLink} to={`/order/${orderId}`}>
              Back to order
            </Button>
          </EmptyState.Content>
        </EmptyState.Root>
      </Flex>
    )
  }

  if (items.length === 0) {
    return (
      <Flex minH="50vh" align="center" justify="center" px={4}>
        <Text color="gray.500">No line items in this order.</Text>
      </Flex>
    )
  }

  return (
    <Box maxW="1200px" mx="auto" px={4} py={8}>
      <Stack gap={6}>
        <Stack gap={1}>
          <Text fontSize="2xl" fontWeight="900">
            Return order
          </Text>
          <Text fontSize="sm" color="gray.500">
            Order {order?.id ?? order?._id ?? "—"} · Select items and quantities to return.
          </Text>
        </Stack>

        <Stack gap={3}>
          <Text fontSize="lg" fontWeight="800">
            Products
          </Text>
          <ProductList
            items={items}
            variant="return"
            renderItem={(item) => (
              <ProductCard
                key={item.id}
                data={item}
                variant="return"
                selected={item.selected}
                onToggleSelected={(checked) => toggleSelected(item.id, checked)}
                onIncrease={() => increaseQty(item.id)}
                onDecrease={() => decreaseQty(item.id)}
              />
            )}
          />
        </Stack>

        <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={4}>
          <Stack gap={3}>
            <Text fontSize="lg" fontWeight="800">
              Reason
            </Text>
            <Separator />
            <Textarea
              placeholder="Why are you returning these items? (optional, max 300 characters per item)"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              maxLength={300}
            />
          </Stack>
        </Box>

        <HStack justify="center" gap={4} flexWrap="wrap">
          <Button variant="outline" as={RouterLink} to={`/order/${orderId}`}>
            Back to order
          </Button>
          <Button
            size="lg"
            colorPalette="orange"
            disabled={!hasSelected || returnMutation.isPending}
            onClick={() => setConfirmOpen(true)}
          >
            Return
          </Button>
        </HStack>

        {returnMutation.isError && (
          <Text fontSize="sm" color="red.500" textAlign="center">
            {returnMutation.error?.response?.data?.message ??
              returnMutation.error?.message ??
              "Could not submit return request."}
          </Text>
        )}
      </Stack>

      <Dialog.Root
        role="alertdialog"
        open={confirmOpen}
        size="sm"
        onOpenChange={(e) => setConfirmOpen(e.open)}
        placement="center"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.CloseTrigger asChild>
                <CloseButton />
              </Dialog.CloseTrigger>
              <Dialog.Header>
                <Dialog.Title>Confirm return request</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text fontSize="sm" color="gray.600">
                  Submit this return request for the selected items? You will be redirected back to your order.
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={returnMutation.isPending}>
                  Cancel
                </Button>
                <Button colorPalette="orange" onClick={submitReturn} disabled={returnMutation.isPending}>
                  {returnMutation.isPending ? "Submitting..." : "Confirm return"}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  )
}

export default Return
