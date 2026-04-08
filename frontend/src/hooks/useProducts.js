import { useQuery } from '@tanstack/react-query'
import productsApi from '../APIs/products.api'

export const useProducts = (filters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.getProducts(filters),
    keepPreviousData: true,
    cacheTime: 1000 * 60 * 30,
    staleTime: 1000 * 60 * 10,
  })
}

// Fetch a single product by id for the Product page.
// Backend response shape: `{ product, reviewsPreview, hasMoreReviews }`.
export const useProductById = (productId, options = {}) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.getProductById(productId),
    enabled: Boolean(productId),
    cacheTime: 1000 * 60 * 30,
    staleTime: 1000 * 60 * 10,
    ...options,
  })
}
