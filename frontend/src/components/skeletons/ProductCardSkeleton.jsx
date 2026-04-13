import { Box, HStack, Skeleton, SkeletonText, Stack } from "@chakra-ui/react"

const ActionRowSkeleton = ({ variant }) => {
  if (variant === "cart" || variant === "return") {
    return (
      <HStack justify="space-between" align="center">
        <Skeleton h="28px" w="28px" rounded="md" />
        <Skeleton h="12px" w="32px" />
        <Skeleton h="28px" w="28px" rounded="md" />
      </HStack>
    )
  }

  if (variant === "order") {
    return <Skeleton h="12px" w="110px" />
  }

  return (
    <HStack gap={2}>
      <Skeleton h="32px" flex="1" rounded="md" />
      <Skeleton h="32px" flex="1" rounded="md" />
    </HStack>
  )
}

export const ProductCardSkeleton = ({ variant = "default" }) => {
  return (
    <Box borderWidth="1px" borderColor="surface.border" rounded="lg" p={3} bg="surface.panel">
      <Skeleton w="100%" aspectRatio={1} rounded="md" />
      <Stack mt={3} gap={2}>
        <SkeletonText noOfLines={2} />
        <Skeleton h="12px" w="70%" />
        <HStack justify="space-between" align="center">
          <Skeleton h="14px" w="72px" />
          <Skeleton h="14px" w="44px" />
        </HStack>
        <ActionRowSkeleton variant={variant} />
      </Stack>
    </Box>
  )
}

export default ProductCardSkeleton

