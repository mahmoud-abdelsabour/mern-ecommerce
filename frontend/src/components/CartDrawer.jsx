import {
  Button,
  CloseButton,
  Drawer,
  HStack,
  Portal,
  Skeleton,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"
import { useCart } from "../hooks/useCart"
import { getToken } from "../APIs/http"
import DrawerCard from "./DrawerCard"
import { cartLineToDrawerFields } from "../utils/cartLineToDrawerFields"
import DrawerCardSkeleton from "./skeletons/DrawerCardSkeleton"

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
            <Drawer.Header borderBottomWidth="1px" borderColor="surface.border" pb={3}>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
              <Drawer.Title fontSize="xl" fontWeight="900">
                Your Cart
              </Drawer.Title>
              <Drawer.Description fontSize="sm" color="text.muted" mt={1}>
                {!token ? (
                  "Sign in to view your cart"
                ) : isLoading ? (
                  <Skeleton h="12px" w="240px" />
                ) : rows.length > 0 ? (
                  `${rows.length} item${rows.length === 1 ? "" : "s"} in your cart`
                ) : (
                  "Review items before checkout"
                )}
              </Drawer.Description>
            </Drawer.Header>

            <Drawer.Body flex="1" overflowY="auto" py={4}>
              {!token ? (
                <Text fontSize="sm" color="text.muted">
                  Sign in to view your cart.
                </Text>
              ) : isLoading ? (
                <VStack align="stretch" gap={3}>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <DrawerCardSkeleton key={`drawer-card-skel-${idx}`} />
                  ))}
                </VStack>
              ) : isError ? (
                <Text fontSize="sm" color="red.600">
                  {error?.response?.data?.message ?? error?.message ?? "Could not load cart."}
                </Text>
              ) : rows.length === 0 ? (
                <Text fontSize="sm" color="text.muted">
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

            <Drawer.Footer borderTopWidth="1px" borderColor="surface.border" pt={3}>
              <Stack gap={3} w="100%">
                <Button as={RouterLink} to="/cart" variant="outline" colorPalette="neutral" size="lg" w="100%" onClick={() => onOpenChange(false)}>
                  View cart
                </Button>
                <Button
                  as={RouterLink}
                  to="/order/check-out"
                  colorPalette="brand"
                  size="lg"
                  w="100%"
                  onClick={() => onOpenChange(false)}
                >
                  Checkout
                </Button>
                <HStack justify="center" w="100%">
                  <Drawer.CloseTrigger asChild>
                    <Button variant="ghost" size="sm" colorPalette="neutral">
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
