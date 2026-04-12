// Catalog page:
// - Left side: filter controls (brand/category/price/rating)
// - Right side: product list/grid (via `ProductList`) or an empty state
// - All filters are stored in the URL query string so the page is shareable and the backend can read `request.query`.
import {
  Box,
  Button,
  Checkbox,
  EmptyState,
  HStack,
  Portal,
  Select,
  Separator,
  Skeleton,
  Slider,
  Stack,
  Text,
  RatingGroup,
  VStack,
  SimpleGrid,
  createListCollection,
} from "@chakra-ui/react"
import { useMemo } from "react"
import ProductList from "../components/ProductList"
import ProductGridSkeleton from "../components/skeletons/ProductGridSkeleton"
import { PiEmptyFill } from "react-icons/pi"
import PaginationControls from "../components/PaginationControls"
import { useProducts } from "../hooks/useProducts"
import { useBrands } from "../hooks/useBrands"
import { useCategories } from "../hooks/useCategories"
import { useCatalogFilters } from "../hooks/useCatalogFilters"
import { slugifyLoose, toggleListValue } from "../utils/filterHelpers"

const Catalog = () => {
  // Price slider configuration (must remain valid for Chakra/Zag slider).
  const sliderMin = 0
  const sliderMax = 100000
  const sliderStep = 1
  const sliderMinStepsBetweenThumbs = 1
  const pageSize = 12

  const {
    filters,
    setBrands,
    setCategories,
    setPriceRange,
    setMinRating,
    setSort,
    setPage,
    resetFilters,
    defaultSort,
  } = useCatalogFilters({ sliderMin, sliderMax, sliderStep, sliderMinStepsBetweenThumbs })

  const selectedBrands = filters.selectedBrands
  const selectedCategories = filters.selectedCategories
  const priceRange = filters.priceRange
  const minRating = filters.minRating
  const sort = filters.sort
  const page = filters.page
  const searchQuery = filters.search

  // Build the backend/API query object from current UI state.
  // IMPORTANT:
  // - The backend expects *slugs* (not display names).
  // - Multi-select is supported via comma-separated lists (e.g. brand=apple,samsung).
  const apiFilters = useMemo(() => {
    const [minP, maxP] = priceRange
    return {
      brand: selectedBrands.length > 0 ? selectedBrands.join(",") : undefined,
      category: selectedCategories.length > 0 ? selectedCategories.join(",") : undefined,
      minPrice: minP,
      maxPrice: maxP,
      minRating,
      sort: sort === defaultSort ? undefined : sort,
      page,
      limit: pageSize,
      ...(searchQuery ? { search: searchQuery } : {}),
    }
  }, [
    defaultSort,
    minRating,
    page,
    pageSize,
    priceRange,
    searchQuery,
    selectedBrands,
    selectedCategories,
    sort,
  ])

  // Fetch products from the server (hook decides how/when to refetch).
  const { data, isLoading, isFetching, isError, error } = useProducts(apiFilters)

  // Ensure we always work with an array, even if the response is missing/undefined.
  const products = data?.products ?? []
  const pagination = data?.pagination ?? null
  const totalProducts = Number(pagination?.totalProducts ?? products.length ?? 0)

  // Transform backend products into the `ProductList` item shape.
  const items = products.map((p) => ({
      id: p?.id ?? p?._id,
      title: p?.name,
      price: p?.price,
      rating: Math.round(p?.rating?.score) ?? 0,
      brand: p?.brand?.name ?? "—",
      category: p?.category?.name ?? "—",
      image: p?.photos?.[0],
  }))

  // Fetch filter options independently from the products response.
  // This avoids the "options shrink" bug when the API returns filtered data.
  const { data: brandsData, isLoading: brandsLoading } = useBrands()
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories()

  const brandOptions = useMemo(() => {
    const brands = brandsData?.brands ?? []
    const options = brands
      .map((b) => ({
        // IMPORTANT: use backend `slug` to avoid frontend/backend mismatch.
        value: b?.slug ?? slugifyLoose(b?.name),
        label: b?.name ?? b?.slug ?? "—",
      }))
      .filter((o) => o.value)

    // Ensure any selected values exist in the list so users can always unselect.
    for (const slug of selectedBrands) {
      if (!options.some((o) => o.value === slug)) options.push({ value: slug, label: slug })
    }

    return options.sort((a, b) => a.label.localeCompare(b.label))
  }, [brandsData, selectedBrands])

  const categoryOptions = useMemo(() => {
    const categories = categoriesData?.categories ?? []
    const options = categories
      .map((c) => ({
        value: c?.slug ?? slugifyLoose(c?.name),
        label: c?.name ?? c?.slug ?? "—",
      }))
      .filter((o) => o.value)

    for (const slug of selectedCategories) {
      if (!options.some((o) => o.value === slug)) options.push({ value: slug, label: slug })
    }

    return options.sort((a, b) => a.label.localeCompare(b.label))
  }, [categoriesData, selectedCategories])

  const sortCollection = useMemo(() => {
    const items = [
      { label: "Newest", value: JSON.stringify({ createdAt: -1 }) },
      { label: "Oldest", value: JSON.stringify({ createdAt: 1 }) },
      { label: "Rating: High → Low", value: JSON.stringify({ "rating.score": -1 }) },
      { label: "Rating: Low → High", value: JSON.stringify({ "rating.score": 1 }) },
      { label: "Price: High → Low", value: JSON.stringify({ price: -1 }) },
      { label: "Price: Low → High", value: JSON.stringify({ price: 1 }) },
    ]

    return createListCollection({ items })
  }, [])

  // Page UI.
  // - Outer container sets a consistent max width (similar to the Order page).
  // - Main area is a responsive Stack: column on small screens, two columns on large screens.
  return (
    // Outer container (controls page width + adds padding).
    <Box maxW="1400px" mx="auto" px={4} py={8}>
      <Stack gap={6}>
        {/* Header (page title + result count) */}
        <Stack gap={1}>
          <Text fontSize="2xl" fontWeight="900">
            Catalog
          </Text>
          <Text fontSize="sm" color="gray.500">
            {/* While loading we show a placeholder label; otherwise show the current number of items */}
            {isLoading || isFetching ? <Skeleton h="14px" w="160px" /> : `${totalProducts} products`}
          </Text>
          {searchQuery ? (
            <Text fontSize="sm" color="gray.600">
              Results for &quot;{searchQuery}&quot;
            </Text>
          ) : null}
          {isError && (
            <Text fontSize="sm" color="red.500">
              Failed to load products: {error?.response?.data?.message ?? error?.message ?? "Unknown error"}
            </Text>
          )}
        </Stack>

        {/* Main layout: filters (left) + products (right). Stacks vertically on small screens. */}
        <Stack direction={{ base: "column", lg: "row" }} align="stretch" gap={6}>
          {/* Filters sidebar */}
          <Box w={{ base: "100%", lg: "340px" }} borderWidth="1px" borderColor="gray.200" rounded="md" p={4}>
            <Stack gap={5}>
              <HStack justify="space-between" align="center">
                <Text fontSize="lg" fontWeight="900">
                  Filters
                </Text>
                <Button size="xs" variant="outline" onClick={resetFilters}>
                  Clear
                </Button>
              </HStack>
              <Separator />

              {/* Sort filter */}
              <Stack gap={2}>
                <Text fontSize="md" fontWeight="800">
                  Sort
                </Text>
                <Separator />
                <Select.Root
                  collection={sortCollection}
                  size="sm"
                  value={sort ? [sort] : [defaultSort]}
                  onValueChange={(details) => setSort(details.value[0] ?? defaultSort)}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Select sort" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {sortCollection.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </Stack>

              {/* Brands filter (multi-select) */}
              <Stack gap={2}>
                <HStack justify="space-between">
                  <Text fontSize="md" fontWeight="800">
                    Brands ({brandsLoading ? "…" : String((brandsData?.brands ?? []).length)})
                  </Text>
                </HStack>
                <Separator />
                {/* Scroll container to keep the sidebar height reasonable */}
                <Box maxH="180px" overflowY="auto" pr={2}>
                  <Stack gap={2}>
                    {brandsLoading ? (
                      Array.from({ length: 8 }).map((_, idx) => (
                        <HStack key={`brand-skel-${idx}`} gap={2}>
                          <Skeleton h="16px" w="16px" rounded="sm" />
                          <Skeleton h="12px" w="70%" />
                        </HStack>
                      ))
                    ) : brandOptions.length > 0 ? (
                      brandOptions.map((brand) => (
                        <Checkbox.Root
                          key={brand.value}
                          checked={selectedBrands.includes(brand.value)}
                          onCheckedChange={(d) => {
                            // `d.checked` may be boolean or "indeterminate"; normalize to boolean.
                            const checked = Boolean(d.checked)
                            // If checked -> add, else -> remove.
                            const nextList = checked
                              ? toggleListValue(selectedBrands, brand.value)
                              : selectedBrands.filter((b) => b !== brand.value)
                            setBrands(nextList)
                          }}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label fontSize="sm">{brand.label}</Checkbox.Label>
                        </Checkbox.Root>
                      ))
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        No brands found.
                      </Text>
                    )}
                  </Stack>
                </Box>
              </Stack>

              {/* Categories filter (multi-select) */}
              <Stack gap={2}>
                <HStack justify="space-between">
                  <Text fontSize="md" fontWeight="800">
                    Categories ({categoriesLoading ? "…" : String((categoriesData?.categories ?? []).length)})
                  </Text>
                </HStack>
                <Separator />
                <Box maxH="180px" overflowY="auto" pr={2}>
                  <Stack gap={2}>
                    {categoriesLoading ? (
                      Array.from({ length: 8 }).map((_, idx) => (
                        <HStack key={`category-skel-${idx}`} gap={2}>
                          <Skeleton h="16px" w="16px" rounded="sm" />
                          <Skeleton h="12px" w="70%" />
                        </HStack>
                      ))
                    ) : categoryOptions.length > 0 ? (
                      categoryOptions.map((category) => (
                        <Checkbox.Root
                          key={category.value}
                          checked={selectedCategories.includes(category.value)}
                          onCheckedChange={(d) => {
                            // `d.checked` may be boolean or "indeterminate"; normalize to boolean.
                            const checked = Boolean(d.checked)
                            // If checked -> add, else -> remove.
                            const nextList = checked
                              ? toggleListValue(selectedCategories, category.value)
                              : selectedCategories.filter((c) => c !== category.value)
                            setCategories(nextList)
                          }}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label fontSize="sm">{category.label}</Checkbox.Label>
                        </Checkbox.Root>
                      ))
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        No categories found.
                      </Text>
                    )}
                  </Stack>
                </Box>
              </Stack>

              {/* Price range filter (two-thumb slider) */}
              <Stack gap={2}>
                <HStack justify="space-between">
                  <Text fontSize="md" fontWeight="800">
                    Price range
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    ${priceRange[0]} - ${priceRange[1]}
                  </Text>
                </HStack>
                <Separator />
                <Slider.Root
                  maxW="md"
                  min={sliderMin}
                  max={sliderMax}
                  step={sliderStep}
                  value={priceRange}
                  onValueChange={(e) => {
                    // `e.value` is `[min, max]`.
                    setPriceRange(e.value)
                  }}
                  minStepsBetweenThumbs={sliderMinStepsBetweenThumbs}
                >
                  <Slider.Control>
                    <Slider.Track>
                      <Slider.Range />
                    </Slider.Track>
                    <Slider.Thumbs />
                  </Slider.Control>
                </Slider.Root>
              </Stack>

              {/* Rating filter (selects a minimum rating from 0..5) */}
              <Stack gap={2}>
                <HStack justify="space-between">
                  <Text fontSize="md" fontWeight="800">
                    Min rating
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {minRating}+
                  </Text>
                </HStack>
                <Separator />
                <RatingGroup.Root
                  count={5}
                  value={minRating}
                  onValueChange={(e) => {
                    // RatingGroup gives a value; we persist it to the URL.
                    const next = Number(e.value ?? 0)
                    setMinRating(next)
                  }}
                >
                  <RatingGroup.HiddenInput />
                  <RatingGroup.Control />
                </RatingGroup.Root>
              </Stack>
            </Stack>
          </Box>

          {/* Products panel */}
          <Box flex="1" w="100%" minH="70vh" display="flex" flexDirection="column">
            {isLoading && items.length === 0 ? (
              <Box flex="1">
                <ProductGridSkeleton count={pageSize} />
              </Box>
            ) : items.length > 0 ? (
              // When we have products, delegate rendering to `ProductList`.
              <Box flex="1">
                {isFetching ? (
                  <HStack justify="flex-end" mb={2}>
                    <Skeleton h="10px" w="110px" />
                  </HStack>
                ) : null}
                <ProductList items={items} />
              </Box>
            ) : (
              // Empty state uses a grid wrapper so spacing stays similar to the products grid.
              <SimpleGrid columns={{ base: 1, sm: 2, md: 4, lg: 4 }} gap={4} w="100%" flex="1">
                <Box
                  gridColumn="1 / -1"
                  borderWidth="1px"
                  borderColor="gray.200"
                  rounded="md"
                  p={8}
                  h="100%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <EmptyState.Root size={"lg"}>
                    <EmptyState.Content>
                      <EmptyState.Indicator>
                        <PiEmptyFill />
                      </EmptyState.Indicator>
                      <VStack textAlign="center">
                        <EmptyState.Title>It's all quiet here</EmptyState.Title>
                        <EmptyState.Description>No matched products found</EmptyState.Description>
                      </VStack>
                    </EmptyState.Content>
                  </EmptyState.Root>
                </Box>
              </SimpleGrid>
            )}

            {/* Pagination (server-driven) */}
            {pagination?.totalProducts > pageSize && (
              <Box mt={6} display="flex" justifyContent="center">
                  <PaginationControls
                    count={pagination.totalProducts}
                    pageSize={pagination.limit ?? pageSize}
                    page={pagination.currentPage ?? page}
                    onPageChange={setPage}
                    isDisabled={isLoading || isFetching}
                  />
                </Box>
              )}
          </Box>
        </Stack>
      </Stack>
    </Box>
  )
}

// Default export so the router can import the page component.
export default Catalog
