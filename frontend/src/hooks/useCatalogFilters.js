import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { clamp, parseQueryList, serializeQueryList, uniqueSorted } from "../utils/filterHelpers"

// Encapsulates URL <-> state logic for the Catalog page.
// This keeps Catalog.jsx focused on rendering and API calls.
export const useCatalogFilters = ({
  sliderMin = 0,
  sliderMax = 100000,
  sliderStep = 1,
  sliderMinStepsBetweenThumbs = 1,
} = {}) => {
  const [searchParams, setSearchParams] = useSearchParams()

  // `searchParams` is not referentially stable; use a string key for memo deps.
  const searchKey = searchParams.toString()

  const defaultSort = useMemo(() => JSON.stringify({ createdAt: -1 }), [])
  const isValidSortJson = useCallback((value) => {
    if (!value) return false
    try {
      JSON.parse(value)
      return true
    } catch {
      return false
    }
  }, [])

  const filters = useMemo(() => {
    // Read params from a stable snapshot string to avoid dependency churn.
    const params = new URLSearchParams(searchKey)

    const selectedBrands = uniqueSorted(parseQueryList(params.getAll("brand")))
    const selectedCategories = uniqueSorted(parseQueryList(params.getAll("category")))

    // `URLSearchParams.get()` returns `null` when missing.
    // IMPORTANT: `Number(null)` is `0`, which would incorrectly force the slider to start at `0..1`.
    // Treat missing params as `NaN` so we can fall back to full range defaults.
    const minPStr = params.get("minPrice")
    const maxPStr = params.get("maxPrice")
    const minP = minPStr === null ? Number.NaN : Number(minPStr)
    const maxP = maxPStr === null ? Number.NaN : Number(maxPStr)

    let nextMin = Number.isFinite(minP) ? clamp(minP, sliderMin, sliderMax) : sliderMin
    let nextMax = Number.isFinite(maxP) ? clamp(maxP, sliderMin, sliderMax) : sliderMax
    if (nextMin > nextMax) [nextMin, nextMax] = [nextMax, nextMin]

    // Enforce a minimum gap between slider thumbs so Chakra/Zag config stays valid.
    const minGap = sliderStep * sliderMinStepsBetweenThumbs
    if (nextMax - nextMin < minGap) {
      const expandedMax = Math.min(sliderMax, nextMin + minGap)
      const expandedMin = Math.max(sliderMin, nextMax - minGap)
      if (expandedMax - nextMin >= minGap) nextMax = expandedMax
      else nextMin = expandedMin
    }

    const ratingStr = params.get("minRating")
    const rating = ratingStr === null ? Number.NaN : Number(ratingStr)
    const minRating = Number.isFinite(rating) ? clamp(Math.round(rating), 0, 5) : 0

    const sortStr = params.get("sort")
    const sort = sortStr && isValidSortJson(sortStr) ? sortStr : defaultSort

    return {
      selectedBrands,
      selectedCategories,
      priceRange: [nextMin, nextMax],
      minRating,
      sort,
    }
  }, [
    defaultSort,
    isValidSortJson,
    searchKey,
    sliderMax,
    sliderMin,
    sliderMinStepsBetweenThumbs,
    sliderStep,
  ])

  // Single place to mutate the query string.
  // Note: we keep numeric filters present so the backend always receives explicit bounds.
  const updateQuery = useCallback(
    (updater, { replace = true } = {}) => {
      const next = new URLSearchParams(searchKey)
      updater(next)

      // Normalize list params (dedupe + sort) and remove them when empty.
      for (const key of ["brand", "category"]) {
        const list = uniqueSorted(parseQueryList(next.getAll(key)))
        const serialized = serializeQueryList(list)
        next.delete(key)
        if (serialized) next.set(key, serialized)
      }

      // Normalize sort:
      // - Remove invalid JSON to avoid backend JSON.parse errors.
      // - Remove default sort from the URL (shorter URLs; backend already defaults to newest).
      const nextSort = next.get("sort")
      if (!nextSort) {
        // no-op
      } else if (!isValidSortJson(nextSort) || nextSort === defaultSort) {
        next.delete("sort")
      }

      // Always keep numeric filters present in the URL.
      if (!next.has("minPrice")) next.set("minPrice", String(filters.priceRange[0]))
      if (!next.has("maxPrice")) next.set("maxPrice", String(filters.priceRange[1]))
      if (!next.has("minRating")) next.set("minRating", String(filters.minRating))

      const nextKey = next.toString()
      if (nextKey !== searchKey) setSearchParams(next, { replace })
    },
    [
      defaultSort,
      filters.minRating,
      filters.priceRange,
      isValidSortJson,
      searchKey,
      setSearchParams,
    ]
  )

  const setBrands = useCallback(
    (brands) => {
      const value = serializeQueryList(uniqueSorted(brands))
      updateQuery((sp) => {
        if (value) sp.set("brand", value)
        else sp.delete("brand")
      })
    },
    [updateQuery]
  )

  const setCategories = useCallback(
    (categories) => {
      const value = serializeQueryList(uniqueSorted(categories))
      updateQuery((sp) => {
        if (value) sp.set("category", value)
        else sp.delete("category")
      })
    },
    [updateQuery]
  )

  const setPriceRange = useCallback(
    (range) => {
      const [minP, maxP] = range
      updateQuery((sp) => {
        sp.set("minPrice", String(minP))
        sp.set("maxPrice", String(maxP))
      })
    },
    [updateQuery]
  )

  const setMinRating = useCallback(
    (rating) => {
      updateQuery((sp) => {
        sp.set("minRating", String(rating))
      })
    },
    [updateQuery]
  )

  const setSort = useCallback(
    (sortValue) => {
      updateQuery((sp) => {
        if (!sortValue || sortValue === defaultSort) sp.delete("sort")
        else sp.set("sort", String(sortValue))
      })
    },
    [defaultSort, updateQuery]
  )

  const resetFilters = useCallback(() => {
    updateQuery((sp) => {
      sp.delete("brand")
      sp.delete("category")
      sp.delete("sort")
      sp.set("minPrice", String(sliderMin))
      sp.set("maxPrice", String(sliderMax))
      sp.set("minRating", "0")
    })
  }, [sliderMax, sliderMin, updateQuery])

  return {
    filters,
    updateQuery,
    setBrands,
    setCategories,
    setPriceRange,
    setMinRating,
    setSort,
    resetFilters,
    defaultSort,
  }
}
