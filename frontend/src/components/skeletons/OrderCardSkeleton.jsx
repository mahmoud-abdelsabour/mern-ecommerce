import { Box, HStack, Skeleton, Stack } from "@chakra-ui/react"

export const OrderCardSkeleton = () => {
  return (
    <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={4} bg="white">
      <HStack spacing={3} align="start">
        <HStack spacing={2}>
          <Skeleton w="80px" h="80px" rounded="md" />
          <Skeleton w="80px" h="80px" rounded="md" />
        </HStack>
        <Stack spacing={2} flex="1">
          <Skeleton h="12px" w="120px" />
          <Skeleton h="12px" w="180px" />
          <Skeleton h="12px" w="140px" />
          <Skeleton h="12px" w="100px" />
        </Stack>
      </HStack>
    </Box>
  )
}

export default OrderCardSkeleton

