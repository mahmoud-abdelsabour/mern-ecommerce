import { ProductCard } from "./ProductCard"
import { Box, HStack, SimpleGrid } from "@chakra-ui/react"

const ProductList = ({ items, variant = "default", renderItem, layout = "grid" }) => {
  if (layout === "rail") {
    return (
      <Box overflowX="auto" overflowY="hidden" scrollSnapType="x mandatory" scrollBehavior="smooth" pb={2}>
        <HStack align="stretch" gap={4} minW="max-content" pr={1}>
          {items.map((item) => (
            <Box key={item.id} flex="0 0 auto" minW="200px" maxW="200px" scrollSnapAlign="start">
              {renderItem ? renderItem(item) : <ProductCard data={item} variant={variant} />}
            </Box>
          ))}
        </HStack>
      </Box>
    )
  }

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
      {items.map((item) =>
        renderItem ? renderItem(item) : <ProductCard key={item.id} data={item} variant={variant} />
      )}
    </SimpleGrid>
  )
}

export default ProductList
