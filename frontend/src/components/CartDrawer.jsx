import {
  Button,
  CloseButton,
  Drawer,
  HStack,
  Portal,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"
import { useCart } from "../hooks/useCart"
import { getToken } from "../APIs/http"
import DrawerCard from "./DrawerCard"
import { cartLineToDrawerFields } from "../utils/cartLineToDrawerFields"

const CartDrawer = ({ open, onOpenChange }) => {
  const token = getToken()
  const { data, isLoading, isError, error } = useCart({ enabled: Boolean(token) })
  const cart = Array.isArray(data) ? data : []
  const rows = cart.map(cartLineToDrawerFields)

  return (
    <Drawer.Root open={open} onOpenChange={(e) => onOpenChange(e.open)} placement="end" size="md">
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content maxH="100dvh" display="flex" flexDirection="column">
            <Drawer.Header borderBottomWidth="1px" borderColor="gray.200" pb={3}>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
              <Drawer.Title fontSize="xl" fontWeight="900">
                Your Cart
              </Drawer.Title>
              <Drawer.Description fontSize="sm" color="gray.600" mt={1}>
                {rows.length > 0 ? `${rows.length} item${rows.length === 1 ? "" : "s"} in your cart` : "Review items before checkout"}
              </Drawer.Description>
            </Drawer.Header>

            <Drawer.Body flex="1" overflowY="auto" py={4}>
              {!token ? (
                <Text fontSize="sm" color="gray.600">
                  Sign in to view your cart.
                </Text>
              ) : isLoading ? (
                <Text fontSize="sm" color="gray.500">
                  Loading cart…
                </Text>
              ) : isError ? (
                <Text fontSize="sm" color="red.500">
                  {error?.response?.data?.message ?? error?.message ?? "Could not load cart."}
                </Text>
              ) : rows.length === 0 ? (
                <Text fontSize="sm" color="gray.600">
                  Your cart is empty. Add products from the catalog or product pages.
                </Text>
              ) : (
                <VStack align="stretch" gap={3}>
                  {rows.map((row) => (
                    <DrawerCard key={String(row.id ?? row.name)} {...row} />
                  ))}
                </VStack>
              )}
            </Drawer.Body>

            <Drawer.Footer borderTopWidth="1px" borderColor="gray.200" pt={3}>
              <Stack gap={3} w="100%">
                <Button as={RouterLink} to="/cart" variant="outline" size="lg" w="100%" onClick={() => onOpenChange(false)}>
                  View cart
                </Button>
                <Button
                  as={RouterLink}
                  to="/order/check-out"
                  colorPalette="teal"
                  size="lg"
                  w="100%"
                  onClick={() => onOpenChange(false)}
                >
                  Checkout
                </Button>
                <HStack justify="center" w="100%">
                  <Drawer.CloseTrigger asChild>
                    <Button variant="ghost" size="sm" colorPalette="gray">
                      Continue shopping
                    </Button>
                  </Drawer.CloseTrigger>
                </HStack>
              </Stack>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}

export default CartDrawer
