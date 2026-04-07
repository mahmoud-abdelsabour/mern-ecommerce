// Small, shared helpers for Catalog-style filters.
// Kept in a standalone module so:
// - URL parsing/serialization stays consistent across pages/hooks.
// - UI code (Catalog.jsx) stays focused on rendering.

// A *loose* slugifier used only as a fallback for legacy URLs or missing backend slugs.
// Prefer backend-provided `slug` whenever possible to avoid mismatch bugs.
export const slugifyLoose = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

// Parse list-like query params into an array.
// Supports:
// - "nike,adidas"
// - ["nike", "adidas"]
// - ["nike,adidas"] (URLSearchParams.getAll when param is repeated)
export const parseQueryList = (value) => {
  if (value == null) return []

  const parts = Array.isArray(value) ? value : [value]
  return parts
    .flatMap((v) => String(v).split(","))
    .map((v) => v.trim())
    .filter(Boolean)
}

// Serialize an array into the comma-separated format we use for URL query params.
export const serializeQueryList = (list) => {
  if (!list || list.length === 0) return ""
  return list.join(",")
}

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export const toggleListValue = (list, value) => {
  if (list.includes(value)) return list.filter((v) => v !== value)
  return [...list, value]
}

export const uniqueSorted = (list) => Array.from(new Set(list)).sort()

