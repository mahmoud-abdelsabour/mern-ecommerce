import { Box, HStack, Image, Separator, Stack, Text } from "@chakra-ui/react"

/**
 * Single cart line in the cart drawer: name, price, brand, category, quantity.
 */
const DrawerCard = ({ name, price, brand, category, quantity, image }) => {
  const unit = Number(price) || 0
  const qty = Number(quantity) || 1
  const lineTotal = unit * qty

  return (
    <Box borderWidth="1px" borderColor="surface.border" rounded="lg" p={3} bg="surface.panel">
      <HStack align="flex-start" gap={3}>
        <Box flexShrink={0} w="64px" h="64px" rounded="md" overflow="hidden" bg="surface.elevated" borderWidth="1px" borderColor="surface.border">
          <Image
            src={image || "https://placehold.co/128x128?text=No+image"}
            alt={name}
            w="100%"
            h="100%"
            objectFit="cover"
          />
        </Box>
        <Stack gap={1} flex="1" minW={0}>
          <Text fontWeight="700" fontSize="sm" lineClamp={2}>
            {name}
          </Text>
          <Text fontSize="xs" color="text.muted" lineClamp={1}>
            {brand} · {category}
          </Text>
          <Separator my={1} />
          <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
            <Stack gap={0}>
              <Text fontSize="xs" color="text.subtle">
                ${unit.toFixed(2)} each
              </Text>
              <Text fontSize="sm" fontWeight="800" color="brand.700">
                ${lineTotal.toFixed(2)} total
              </Text>
            </Stack>
            <Box px={2} py={1} rounded="md" bg="surface.elevated" borderWidth="1px" borderColor="surface.border">
              <Text fontSize="xs" fontWeight="700">
                Qty {qty}
              </Text>
            </Box>
          </HStack>
        </Stack>
      </HStack>
    </Box>
  )
}

export default DrawerCard
