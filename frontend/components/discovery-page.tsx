"use client"

import { useEffect, useMemo, useState } from "react"
import { SlidersHorizontal, X, ChevronDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PropertyCard } from "@/components/property-card"
import { PaymentModal } from "@/components/payment-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { useProperties } from "@/hooks/use-properties"
import { getOrCreateBrowserSessionId } from "@/lib/browser-session"
import { type Translations } from "@/lib/i18n"
import { type Property, type PropertyType } from "@/lib/properties"
import { cn } from "@/lib/utils"

interface DiscoveryPageProps {
  t: Translations
}

const propertyTypes: PropertyType[] = ["Kost", "Ruko", "Kontrakan", "Villa"]

const facilityOptions = ["wifi", "parking", "ac", "kitchen", "laundry", "security", "pool", "gym"]

export function DiscoveryPage({ t }: DiscoveryPageProps) {
  const [selectedType, setSelectedType] = useState<PropertyType | "">("")
  const [location, setLocation] = useState("")
  const [minSize, setMinSize] = useState("")
  const [maxSize, setMaxSize] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("newest")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unlockedProperties, setUnlockedProperties] = useState<Set<string>>(new Set())
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  const listFilters = useMemo(
    () => ({
      selectedType,
      location,
      minSize,
      maxSize,
      minPrice,
      maxPrice,
      selectedFacilities,
      sortBy,
    }),
    [selectedType, location, minSize, maxSize, minPrice, maxPrice, selectedFacilities, sortBy]
  )

  const { properties, total, loading, error, refetch } = useProperties(listFilters)

  useEffect(() => {
    const sessionId = getOrCreateBrowserSessionId()
    if (!sessionId) return
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch(
          `/api/unlocks?sessionId=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" }
        )
        const json: unknown = await res.json().catch(() => null)
        if (cancelled || !res.ok) return
        const ids =
          json &&
          typeof json === "object" &&
          "data" in json &&
          json.data &&
          typeof json.data === "object" &&
          "propertyIds" in json.data &&
          Array.isArray((json.data as { propertyIds: unknown }).propertyIds)
            ? (json.data as { propertyIds: string[] }).propertyIds
            : []
        setUnlockedProperties(new Set(ids.filter((id) => typeof id === "string")))
      } catch {
        /* keep empty set */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const facilityLabels: Record<string, string> = {
    wifi: t.wifi,
    parking: t.parking,
    ac: t.ac,
    kitchen: t.kitchen,
    laundry: t.laundry,
    security: t.security,
    pool: t.pool,
    gym: t.gym,
  }

  const toggleFacility = (f: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    )
  }

  const resetFilters = () => {
    setSelectedType("")
    setLocation("")
    setMinSize("")
    setMaxSize("")
    setMinPrice("")
    setMaxPrice("")
    setSelectedFacilities([])
    setSortBy("newest")
  }

  const handleUnlock = (property: Property) => {
    setSelectedProperty(property)
  }

  const handlePaymentSuccess = (propertyId: string) => {
    setUnlockedProperties((prev) => new Set([...prev, propertyId]))
  }

  const FilterPanel = () => (
    <div className="space-y-5">
      {/* Property Type */}
      <div>
        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">{t.propertyType}</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType("")}
            className={cn(
              "text-xs px-3 py-1.5 rounded-lg border transition-colors",
              !selectedType
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-muted-foreground border-border hover:border-primary/40"
            )}
          >
            {t.allTypes}
          </button>
          {propertyTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-lg border transition-colors",
                selectedType === type
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-muted-foreground border-border hover:border-primary/40"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">{t.location}</p>
        <Input
          placeholder={t.locationPlaceholder}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="text-sm h-9"
        />
      </div>

      {/* Size */}
      <div>
        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">{t.size}</p>
        <div className="flex gap-2">
          <Input
            placeholder={t.placeholderMin}
            value={minSize}
            onChange={(e) => setMinSize(e.target.value)}
            type="number"
            className="text-sm h-9"
          />
          <Input
            placeholder={t.placeholderMax}
            value={maxSize}
            onChange={(e) => setMaxSize(e.target.value)}
            type="number"
            className="text-sm h-9"
          />
        </div>
      </div>

      {/* Price Range */}
      <div>
        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">{t.priceRange} (IDR)</p>
        <div className="flex gap-2">
          <Input
            placeholder={t.minPrice}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            type="number"
            className="text-sm h-9"
          />
          <Input
            placeholder={t.maxPrice}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            type="number"
            className="text-sm h-9"
          />
        </div>
      </div>

      {/* Facilities */}
      <div>
        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">{t.facilities}</p>
        <div className="flex flex-wrap gap-2">
          {facilityOptions.map((f) => (
            <button
              key={f}
              onClick={() => toggleFacility(f)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-lg border transition-colors",
                selectedFacilities.includes(f)
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-secondary text-muted-foreground border-border hover:border-accent/40"
              )}
            >
              {facilityLabels[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button onClick={resetFilters} variant="outline" size="sm" className="flex-1 text-xs">
          {t.reset}
        </Button>
        <Button size="sm" className="flex-1 text-xs bg-primary text-primary-foreground" onClick={() => setSidebarOpen(false)}>
          {t.apply}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden gap-2 text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t.filters}
          </Button>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" aria-hidden />
            ) : null}
            <span>
              <span className="font-semibold text-foreground">{loading ? "…" : total}</span>{" "}
              {t.propertiesFound}
            </span>
          </p>
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none text-sm bg-card/60 border border-border/70 rounded-xl pl-3 pr-8 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="newest">{t.newest}</option>
            <option value="priceLow">{t.priceLow}</option>
            <option value="priceHigh">{t.priceHigh}</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar — desktop */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="bg-card/70 rounded-2xl border border-border/70 p-5 sticky top-24 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm text-foreground">{t.filters}</h2>
              <button onClick={resetFilters} className="text-xs text-primary hover:underline">
                {t.reset}
              </button>
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-card/95 p-5 overflow-y-auto shadow-2xl border-r border-border/70">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-sm text-foreground">{t.filters}</h2>
                <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-md hover:bg-secondary">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="flex-1">
          {error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <p className="font-semibold text-foreground">{t.loadListingsError}</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">{error}</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
                {t.retry}
              </Button>
            </div>
          ) : loading && properties.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border overflow-hidden bg-card">
                  <Skeleton className="h-48 w-full rounded-none" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-[85%]" />
                    <Skeleton className="h-3 w-[55%]" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <SlidersHorizontal className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground">{t.noPropertiesTitle}</p>
              <p className="text-sm text-muted-foreground mt-1">{t.noPropertiesHint}</p>
              <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4">
                {t.reset}
              </Button>
            </div>
          ) : (
            <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", loading && "opacity-70")}>
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  t={t}
                  unlocked={unlockedProperties.has(property.id)}
                  onUnlock={handleUnlock}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {selectedProperty && (
        <PaymentModal
          property={selectedProperty}
          t={t}
          onClose={() => setSelectedProperty(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
