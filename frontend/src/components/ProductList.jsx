import { ProductCard } from "./ProductCard"
import { SimpleGrid } from "@chakra-ui/react"

const ProductList = ({ items, variant = "default", renderItem }) => {
  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 4, lg: 5 }} gap={4}>
      {items.map((item) =>
        renderItem ? renderItem(item) : <ProductCard key={item.id} data={item} variant={variant} />
      )}
    </SimpleGrid>
  )
}

export default ProductList
