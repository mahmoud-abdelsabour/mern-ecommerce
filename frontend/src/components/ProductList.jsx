import { ProductCard } from "./ProductCard"
import { Box, HStack, SimpleGrid } from "@chakra-ui/react"

const ProductList = ({ items, variant = "default", renderItem, layout = "grid" }) => {
  if (layout === "rail") {
    return (
      <>
        <Box
          display={{ base: "block", md: "none" }}
          overflowX="auto"
          overflowY="hidden"
          scrollSnapType="x mandatory"
          scrollBehavior="smooth"
          pb={2}
        >
          <HStack align="stretch" gap={4} minW="max-content" pr={1}>
            {items.map((item, index) => (
              <Box
                key={item.id ?? `item-${index}`}
                flex="0 0 auto"
                minW={{ base: "82vw", sm: "260px" }}
                maxW="320px"
                scrollSnapAlign="start"
              >
                {renderItem ? renderItem(item) : <ProductCard data={item} variant={variant} />}
              </Box>
            ))}
          </HStack>
        </Box>

        <SimpleGrid
          display={{ base: "none", md: "grid" }}
          columns={{ md: 2, lg: 3, xl: 4 }}
          gap={4}
        >
          {items.map((item, index) =>
            renderItem ? (
              renderItem(item)
            ) : (
              <ProductCard key={item.id ?? `item-${index}`} data={item} variant={variant} />
            )
          )}
        </SimpleGrid>
      </>
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
