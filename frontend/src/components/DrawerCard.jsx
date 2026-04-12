import { Box, HStack, Image, Separator, Stack, Text } from "@chakra-ui/react"

/**
 * Single cart line in the cart drawer: name, price, brand, category, quantity.
 */
const DrawerCard = ({ name, price, brand, category, quantity, image }) => {
  const unit = Number(price) || 0
  const qty = Number(quantity) || 1
  const lineTotal = unit * qty

  return (
    <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={3} bg="gray.50">
      <HStack align="flex-start" gap={3}>
        <Box flexShrink={0} w="64px" h="64px" rounded="md" overflow="hidden" bg="white" borderWidth="1px" borderColor="gray.200">
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
          <Text fontSize="xs" color="gray.600" lineClamp={1}>
            {brand} · {category}
          </Text>
          <Separator my={1} />
          <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
            <Stack gap={0}>
              <Text fontSize="xs" color="gray.600">
                ${unit.toFixed(2)} each
              </Text>
              <Text fontSize="sm" fontWeight="800" color="teal.700">
                ${lineTotal.toFixed(2)} total
              </Text>
            </Stack>
            <Box px={2} py={1} rounded="md" bg="white" borderWidth="1px" borderColor="gray.200">
              <Text fontSize="xs" fontWeight="700" color="gray.800">
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
