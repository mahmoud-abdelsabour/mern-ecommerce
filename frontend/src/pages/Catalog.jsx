import { Box, Checkbox, EmptyState, HStack, Separator, Slider, Stack, Text, RatingGroup, VStack, SimpleGrid } from "@chakra-ui/react"
import { useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import ProductList from "../components/ProductList"
import { properties } from "../constants/products"
import { PiEmptyFill } from "react-icons/pi"

const uniqSorted = (items) => Array.from(new Set(items)).filter(Boolean).sort()

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

  const brands = useMemo(() => uniqSorted(properties.map((p) => p.brand)), [])
  const categories = useMemo(() => uniqSorted(properties.map((p) => p.category)), [])

  const minPrice = useMemo(() => Math.min(...properties.map((p) => Number(p.price ?? 0))), [])
  const maxPrice = useMemo(() => Math.max(...properties.map((p) => Number(p.price ?? 0))), [])

  const sliderStep = 1
  const sliderMinStepsBetweenThumbs = 1

  let baseMin = Math.floor(minPrice)
  let baseMax = Math.ceil(maxPrice)

  if (!Number.isFinite(baseMin)) baseMin = 0
  if (!Number.isFinite(baseMax)) baseMax = baseMin + 100
  if (baseMax <= baseMin) baseMax = baseMin + sliderStep

  const queryState = useMemo(() => {
    const brandParam = parseListParam(searchParams.get("brand"))
    const categoryParam = parseListParam(searchParams.get("category"))

    const selectedBrands = brandParam.filter((b) => brands.includes(b)).sort()
    const selectedCategories = categoryParam.filter((c) => categories.includes(c)).sort()

    const minP = Number(searchParams.get("minPrice"))
    const maxP = Number(searchParams.get("maxPrice"))
    let nextMin = Number.isFinite(minP) ? clamp(minP, baseMin, baseMax) : baseMin
    let nextMax = Number.isFinite(maxP) ? clamp(maxP, baseMin, baseMax) : baseMax
    if (nextMin > nextMax) [nextMin, nextMax] = [nextMax, nextMin]

    const minGap = sliderStep * sliderMinStepsBetweenThumbs
    if (nextMax - nextMin < minGap) {
      const expandedMax = Math.min(baseMax, nextMin + minGap)
      const expandedMin = Math.max(baseMin, nextMax - minGap)
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
  }, [searchParams, brands, categories, baseMin, baseMax, sliderStep, sliderMinStepsBetweenThumbs])

  const selectedBrands = queryState.selectedBrands
  const selectedCategories = queryState.selectedCategories
  const priceRange = queryState.priceRange
  const minRating = queryState.minRating

  const filtered = useMemo(() => {
    const [minP, maxP] = priceRange
    return properties.filter((p) => {
      const brandOk = selectedBrands.length === 0 || selectedBrands.includes(p.brand)
      const categoryOk = selectedCategories.length === 0 || selectedCategories.includes(p.category)
      const price = Number(p.price ?? 0)
      const priceOk = price >= minP && price <= maxP
      const ratingOk = Number(p.rating ?? 0) >= minRating
      return brandOk && categoryOk && priceOk && ratingOk
    })
  }, [selectedBrands, selectedCategories, priceRange, minRating])

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
            {filtered.length} products
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
                    {brands.map((brand) => (
                      <Checkbox.Root
                        key={brand}
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={(d) => {
                          const checked = Boolean(d.checked)
                          const nextList = checked ? toggleList(selectedBrands, brand) : selectedBrands.filter((b) => b !== brand)
                          const value = serializeListParam([...nextList].sort())
                          updateQuery((sp) => {
                            if (value) sp.set("brand", value)
                            else sp.delete("brand")
                          })
                        }}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label fontSize="sm">{brand}</Checkbox.Label>
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
                    {categories.map((category) => (
                      <Checkbox.Root
                        key={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={(d) => {
                          const checked = Boolean(d.checked)
                          const nextList = checked
                            ? toggleList(selectedCategories, category)
                            : selectedCategories.filter((c) => c !== category)
                          const value = serializeListParam([...nextList].sort())
                          updateQuery((sp) => {
                            if (value) sp.set("category", value)
                            else sp.delete("category")
                          })
                        }}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label fontSize="sm">{category}</Checkbox.Label>
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
                  min={baseMin}
                  max={baseMax}
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
            {filtered.length > 0 ? (
              <Box flex="1">
                <ProductList items={filtered} />
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
