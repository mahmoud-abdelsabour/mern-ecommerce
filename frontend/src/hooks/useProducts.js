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
