import type { Property } from "@/lib/properties"
import type { PropertyListQuery } from "@/lib/server/schemas"

/**
 * Applies the same filter semantics as the discovery UI (AND across filters; facilities must include every selected tag).
 */
export function filterAndSortProperties(
  properties: Property[],
  query: PropertyListQuery
): Property[] {
  const {
    type,
    location,
    minSize,
    maxSize,
    minPrice,
    maxPrice,
    facilities,
    sort,
  } = query

  const loc = location?.trim().toLowerCase()
  const facilityList = facilities ?? []

  const filtered = properties.filter((p) => {
    if (type && p.type !== type) return false
    if (loc && !p.location.toLowerCase().includes(loc) && !p.fullAddress.toLowerCase().includes(loc)) {
      return false
    }
    if (minSize !== undefined && p.size < minSize) return false
    if (maxSize !== undefined && p.size > maxSize) return false
    if (minPrice !== undefined && p.price < minPrice) return false
    if (maxPrice !== undefined && p.price > maxPrice) return false
    if (facilityList.length > 0 && !facilityList.every((f) => p.facilities.includes(f))) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "priceLow") return a.price - b.price
    if (sort === "priceHigh") return b.price - a.price
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
  })

  return sorted
}
