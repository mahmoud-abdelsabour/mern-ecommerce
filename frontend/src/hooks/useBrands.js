import { useQuery } from "@tanstack/react-query"
import brandsApi from "../APIs/brands.api"

// Fetch all brands for the Catalog filters (independent from currently loaded products).
export const useBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () => brandsApi.getBrands(),
    cacheTime: 1000 * 60 * 60,
    staleTime: 1000 * 60 * 15,
  })
}

