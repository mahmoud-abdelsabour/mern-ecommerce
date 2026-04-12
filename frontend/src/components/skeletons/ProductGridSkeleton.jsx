import { SimpleGrid } from "@chakra-ui/react"
import ProductCardSkeleton from "./ProductCardSkeleton"

export const ProductGridSkeleton = ({ count = 12, variant = "default" }) => {
  const items = Array.from({ length: count })

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 4, lg: 4 }} gap={4}>
      {items.map((_, idx) => (
        <ProductCardSkeleton key={`product-skel-${idx}`} variant={variant} />
      ))}
    </SimpleGrid>
  )
}

export default ProductGridSkeleton

