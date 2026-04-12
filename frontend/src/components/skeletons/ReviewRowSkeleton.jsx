import { Box, HStack, Skeleton, SkeletonCircle, SkeletonText, Stack } from "@chakra-ui/react"

export const ReviewRowSkeleton = () => {
  return (
    <Stack gap={2} align="stretch">
      <Box borderWidth="1px" borderColor="gray.200" rounded="md" p={4}>
        <Stack gap={3}>
          <HStack justify="space-between" align="center">
            <HStack gap={3}>
              <SkeletonCircle size="8" />
              <Skeleton h="12px" w="140px" />
            </HStack>
            <Skeleton h="10px" w="70px" />
          </HStack>

          <Skeleton h="14px" w="120px" />

          <SkeletonText noOfLines={3} />
        </Stack>
      </Box>

      <HStack gap={2} justify="flex-end">
        <Skeleton h="24px" w="52px" rounded="md" />
        <Skeleton h="24px" w="58px" rounded="md" />
      </HStack>
    </Stack>
  )
}

export default ReviewRowSkeleton

