import type { Router } from "express"

import { jsonError } from "../lib/server/http.js"
import { addProperty, buildPropertyFromPayload, getMarketplaceState } from "../lib/server/marketplace-state.js"
import { filterAndSortProperties } from "../lib/server/property-query.js"
import { createPropertyBodySchema, propertyListQuerySchema } from "../lib/server/schemas.js"

export function registerPropertyRoutes(router: Router) {
  router.get("/properties", async (req, res) => {
    const parsed = propertyListQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      const err = jsonError(400, "INVALID_QUERY", "Invalid query parameters", parsed.error.flatten())
      return res.status(err.status).json(err.body)
    }

    const state = await getMarketplaceState()
    const data = filterAndSortProperties(state.properties, parsed.data)
    return res.json({ data, meta: { total: data.length } })
  })

  router.post("/properties", async (req, res) => {
    const parsed = createPropertyBodySchema.safeParse(req.body)
    if (!parsed.success) {
      const err = jsonError(400, "INVALID_BODY", "Invalid listing payload", parsed.error.flatten())
      return res.status(err.status).json(err.body)
    }

    const property = buildPropertyFromPayload(parsed.data)
    await addProperty(property)
    return res.status(201).json({ data: property })
  })

  router.get("/properties/:id", async (req, res) => {
    const id = String(req.params.id ?? "")
    const state = await getMarketplaceState()
    const property = state.properties.find((p) => p.id === id)
    if (!property) {
      const err = jsonError(404, "NOT_FOUND", "Property not found")
      return res.status(err.status).json(err.body)
    }
    return res.json({ data: property })
  })
}

