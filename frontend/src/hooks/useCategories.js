import { useQuery } from "@tanstack/react-query"
import categoriesApi from "../APIs/categories.api"

// Fetch all categories for the Catalog filters (independent from currently loaded products).
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getCategories(),
    cacheTime: 1000 * 60 * 60,
    staleTime: 1000 * 60 * 15,
  })
}

