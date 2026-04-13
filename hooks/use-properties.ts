"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import type { Property, PropertyType } from "@/lib/properties"

export interface PropertyListFilters {
  selectedType: PropertyType | ""
  location: string
  minSize: string
  maxSize: string
  minPrice: string
  maxPrice: string
  selectedFacilities: string[]
  sortBy: string
}

export interface PropertiesListResponse {
  data: Property[]
  meta: { total: number }
}

function buildSearchParams(filters: PropertyListFilters): string {
  const params = new URLSearchParams()

  if (filters.selectedType) {
    params.set("type", filters.selectedType)
  }

  const location = filters.location.trim()
  if (location) {
    params.set("location", location)
  }

  const minSize = filters.minSize.trim()
  if (minSize) {
    params.set("minSize", minSize)
  }
  const maxSize = filters.maxSize.trim()
  if (maxSize) {
    params.set("maxSize", maxSize)
  }
  const minPrice = filters.minPrice.trim()
  if (minPrice) {
    params.set("minPrice", minPrice)
  }
  const maxPrice = filters.maxPrice.trim()
  if (maxPrice) {
    params.set("maxPrice", maxPrice)
  }

  if (filters.selectedFacilities.length > 0) {
    params.set("facilities", filters.selectedFacilities.join(","))
  }

  if (filters.sortBy === "priceLow" || filters.sortBy === "priceHigh") {
    params.set("sort", filters.sortBy)
  } else {
    params.set("sort", "newest")
  }

  return params.toString()
}

export interface UsePropertiesResult {
  properties: Property[]
  total: number
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Loads marketplace listings from the App Router API with debounced query params.
 */
export function useProperties(filters: PropertyListFilters, debounceMs = 400): UsePropertiesResult {
  const [properties, setProperties] = useState<Property[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const fetchGeneration = useRef(0)

  const queryString = useMemo(() => buildSearchParams(filters), [filters])

  const runFetch = useCallback(
    async (signal: AbortSignal) => {
      const generation = ++fetchGeneration.current
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/properties?${queryString}`, {
          signal,
          cache: "no-store",
        })
        const json: unknown = await res.json().catch(() => null)
        if (generation !== fetchGeneration.current) {
          return
        }
        if (!res.ok) {
          const message =
            json &&
            typeof json === "object" &&
            "error" in json &&
            json.error &&
            typeof json.error === "object" &&
            "message" in json.error &&
            typeof (json.error as { message: unknown }).message === "string"
              ? (json.error as { message: string }).message
              : "Failed to load properties"
          throw new Error(message)
        }
        const list = json as PropertiesListResponse
        if (!Array.isArray(list.data)) {
          throw new Error("Invalid response from server")
        }
        if (generation !== fetchGeneration.current) {
          return
        }
        setProperties(list.data)
        setTotal(typeof list.meta?.total === "number" ? list.meta.total : list.data.length)
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") {
          return
        }
        if (generation !== fetchGeneration.current) {
          return
        }
        setError(e instanceof Error ? e.message : "Failed to load properties")
        setProperties([])
        setTotal(0)
      } finally {
        if (generation === fetchGeneration.current) {
          setLoading(false)
        }
      }
    },
    [queryString]
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      controllerRef.current?.abort()
      const next = new AbortController()
      controllerRef.current = next
      void runFetch(next.signal)
    }, debounceMs)

    return () => {
      window.clearTimeout(timer)
      controllerRef.current?.abort()
    }
  }, [debounceMs, runFetch])

  const refetch = useCallback(() => {
    controllerRef.current?.abort()
    const next = new AbortController()
    controllerRef.current = next
    void runFetch(next.signal)
  }, [runFetch])

  return { properties, total, loading, error, refetch }
}
