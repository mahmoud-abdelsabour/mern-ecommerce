import { Box, HStack, Skeleton, Stack } from "@chakra-ui/react"

export const DrawerCardSkeleton = () => {
  return (
    <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={3} bg="gray.50">
      <HStack align="flex-start" gap={3}>
        <Skeleton flexShrink={0} w="64px" h="64px" rounded="md" />
        <Stack gap={2} flex="1" minW={0}>
          <Skeleton h="12px" w="85%" />
          <Skeleton h="10px" w="55%" />
          <HStack justify="space-between" align="center">
            <Stack gap={1}>
              <Skeleton h="10px" w="90px" />
              <Skeleton h="12px" w="110px" />
            </Stack>
            <Skeleton h="26px" w="58px" rounded="md" />
          </HStack>
        </Stack>
      </HStack>
    </Box>
  )
}

export default DrawerCardSkeleton

