import { Box, Checkbox, EmptyState, HStack, Separator, Slider, Stack, Text, RatingGroup, VStack, SimpleGrid } from "@chakra-ui/react"
import { useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import ProductList from "../components/ProductList"
import { PiEmptyFill } from "react-icons/pi"
import { useProducts } from "../hooks/useProducts"

const slugify = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const parseListParam = (value) => {
  if (!value) return []
  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
}

const serializeListParam = (list) => {
  if (!list || list.length === 0) return ""
  return list.join(",")
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const sliderMin = 0
  const sliderMax = 100000
  const sliderStep = 1
  const sliderMinStepsBetweenThumbs = 1

  const queryState = useMemo(() => {
    const brandParam = parseListParam(searchParams.get("brand"))
    const categoryParam = parseListParam(searchParams.get("category"))

    const selectedBrands = brandParam.sort()
    const selectedCategories = categoryParam.sort()

    const minP = Number(searchParams.get("minPrice"))
    const maxP = Number(searchParams.get("maxPrice"))
    let nextMin = Number.isFinite(minP) ? clamp(minP, sliderMin, sliderMax) : sliderMin
    let nextMax = Number.isFinite(maxP) ? clamp(maxP, sliderMin, sliderMax) : sliderMax
    if (nextMin > nextMax) [nextMin, nextMax] = [nextMax, nextMin]

    const minGap = sliderStep * sliderMinStepsBetweenThumbs
    if (nextMax - nextMin < minGap) {
      const expandedMax = Math.min(sliderMax, nextMin + minGap)
      const expandedMin = Math.max(sliderMin, nextMax - minGap)
      // Prefer expanding max first, then min if needed
      if (expandedMax - nextMin >= minGap) nextMax = expandedMax
      else nextMin = expandedMin
    }

    const rating = Number(searchParams.get("minRating"))
    const nextRating = Number.isFinite(rating) ? clamp(Math.round(rating), 0, 5) : 0

    return {
      selectedBrands,
      selectedCategories,
      priceRange: [nextMin, nextMax],
      minRating: nextRating,
    }
  }, [searchParams, sliderMin, sliderMax, sliderStep, sliderMinStepsBetweenThumbs])

  const selectedBrands = queryState.selectedBrands
  const selectedCategories = queryState.selectedCategories
  const priceRange = queryState.priceRange
  const minRating = queryState.minRating

  const apiFilters = useMemo(() => {
    const [minP, maxP] = priceRange
    return {
      brand: selectedBrands.length === 1 ? selectedBrands[0] : undefined,
      category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
      minPrice: minP,
      maxPrice: maxP,
      minRating,
    }
  }, [selectedBrands, selectedCategories, priceRange, minRating])

  const { data, isLoading } = useProducts(apiFilters)

  const products = useMemo(() => data?.products ?? [], [data])

  const items = useMemo(() => {
    return products.map((p) => ({
      id: p?.id ?? p?._id,
      title: p?.name,
      price: p?.price,
      rating: p?.rating?.score ?? 0,
      brand: p?.brand?.name ?? "—",
      category: p?.category?.name ?? "—",
      image: p?.photos?.[0],
    }))
  }, [products])

  const brandOptions = useMemo(() => {
    const map = new Map()
    for (const p of products) {
      const name = p?.brand?.name
      if (!name) continue
      const value = slugify(name)
      if (!value) continue
      if (!map.has(value)) map.set(value, name)
    }
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [products])

  const categoryOptions = useMemo(() => {
    const map = new Map()
    for (const p of products) {
      const name = p?.category?.name
      if (!name) continue
      const value = slugify(name)
      if (!value) continue
      if (!map.has(value)) map.set(value, name)
    }
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [products])

  const updateQuery = (updater) => {
    const next = new URLSearchParams(searchParams)
    updater(next)

    // Always keep numeric filters present in the URL (backend-friendly defaults).
    if (!next.has("minPrice")) next.set("minPrice", String(priceRange[0]))
    if (!next.has("maxPrice")) next.set("maxPrice", String(priceRange[1]))
    if (!next.has("minRating")) next.set("minRating", String(minRating))

    const currentStr = searchParams.toString()
    const nextStr = next.toString()
    if (currentStr !== nextStr) setSearchParams(next, { replace: true })
  }

  const toggleList = (list, value) => {
    if (list.includes(value)) return list.filter((v) => v !== value)
    return [...list, value]
  }

  return (
    <Box maxW="1400px" mx="auto" px={4} py={8}>
      <Stack gap={6}>
        <Stack gap={1}>
          <Text fontSize="2xl" fontWeight="900">
            Catalog
          </Text>
          <Text fontSize="sm" color="gray.500">
            {isLoading ? "Loading..." : `${items.length} products`}
          </Text>
        </Stack>

        <Stack direction={{ base: "column", lg: "row" }} align="stretch" gap={6}>
          <Box w={{ base: "100%", lg: "340px" }} borderWidth="1px" borderColor="gray.200" rounded="md" p={4}>
            <Stack gap={5}>
              <Stack gap={2}>
                <Text fontSize="md" fontWeight="800">
                  Brands
                </Text>
                <Separator />
                <Box maxH="180px" overflowY="auto" pr={2}>
                  <Stack gap={2}>
                    {brandOptions.map((brand) => (
                      <Checkbox.Root
                        key={brand.value}
                        checked={selectedBrands.includes(brand.value)}
                        onCheckedChange={(d) => {
                          const checked = Boolean(d.checked)
                          const nextList = checked
                            ? toggleList(selectedBrands, brand.value)
                            : selectedBrands.filter((b) => b !== brand.value)
                          const value = serializeListParam([...nextList].sort())
                          updateQuery((sp) => {
                            if (value) sp.set("brand", value)
                            else sp.delete("brand")
                          })
                        }}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label fontSize="sm">{brand.label}</Checkbox.Label>
                      </Checkbox.Root>
                    ))}
                  </Stack>
                </Box>
              </Stack>

              <Stack gap={2}>
                <Text fontSize="md" fontWeight="800">
                  Categories
                </Text>
                <Separator />
                <Box maxH="180px" overflowY="auto" pr={2}>
                  <Stack gap={2}>
                    {categoryOptions.map((category) => (
                      <Checkbox.Root
                        key={category.value}
                        checked={selectedCategories.includes(category.value)}
                        onCheckedChange={(d) => {
                          const checked = Boolean(d.checked)
                          const nextList = checked
                            ? toggleList(selectedCategories, category.value)
                            : selectedCategories.filter((c) => c !== category.value)
                          const value = serializeListParam([...nextList].sort())
                          updateQuery((sp) => {
                            if (value) sp.set("category", value)
                            else sp.delete("category")
                          })
                        }}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label fontSize="sm">{category.label}</Checkbox.Label>
                      </Checkbox.Root>
                    ))}
                  </Stack>
                </Box>
              </Stack>

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
                    const [minP, maxP] = e.value
                    updateQuery((sp) => {
                      sp.set("minPrice", String(minP))
                      sp.set("maxPrice", String(maxP))
                    })
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
                    const next = Number(e.value ?? 0)
                    updateQuery((sp) => {
                      sp.set("minRating", String(next))
                    })
                  }}
                >
                  <RatingGroup.HiddenInput />
                  <RatingGroup.Control />
                </RatingGroup.Root>
              </Stack>
            </Stack>
          </Box>

          <Box flex="1" w="100%" minH="70vh" display="flex" flexDirection="column">
            {isLoading ? (
              <Box flex="1" display="flex" alignItems="center" justifyContent="center">
                <Text color="gray.500">Loading products...</Text>
              </Box>
            ) : items.length > 0 ? (
              <Box flex="1">
                <ProductList items={items} />
              </Box>
            ) : (
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
          </Box>
        </Stack>
      </Stack>
    </Box>
  )
}

export default Catalog
