/** Normalize a cart API line into display fields (handles populated or id-only `product`). */
export const cartLineToDrawerFields = (line) => {
  const p = line?.product
  const isPopulated = p && typeof p === "object"
  const brandName =
    isPopulated && p.brand && typeof p.brand === "object" && p.brand.name != null
      ? String(p.brand.name)
      : "—"
  const categoryName =
    isPopulated && p.category && typeof p.category === "object" && p.category.name != null
      ? String(p.category.name)
      : "—"
  return {
    id: isPopulated ? (p.id ?? p._id) : p,
    name: isPopulated ? (p.name ?? "Product") : "Product",
    price: isPopulated ? Number(p.price ?? 0) : 0,
    brand: brandName,
    category: categoryName,
    quantity: Number(line?.quantity ?? 1) || 1,
    image: isPopulated ? p.photos?.[0] : undefined,
  }
}
