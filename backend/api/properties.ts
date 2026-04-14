import type { VercelRequest, VercelResponse } from "@vercel/node"

import { jsonError } from "../src/lib/server/http.js"
import { addProperty, buildPropertyFromPayload, getMarketplaceState } from "../src/lib/server/marketplace-state.js"
import { filterAndSortProperties } from "../src/lib/server/property-query.js"
import { createPropertyBodySchema, propertyListQuerySchema } from "../src/lib/server/schemas.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const parsed = propertyListQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      const err = jsonError(400, "INVALID_QUERY", "Invalid query parameters", parsed.error.flatten())
      return res.status(err.status).json(err.body)
    }
    const state = await getMarketplaceState()
    const data = filterAndSortProperties(state.properties, parsed.data)
    return res.status(200).json({ data, meta: { total: data.length } })
  }

  if (req.method === "POST") {
    const parsed = createPropertyBodySchema.safeParse(req.body)
    if (!parsed.success) {
      const err = jsonError(400, "INVALID_BODY", "Invalid listing payload", parsed.error.flatten())
      return res.status(err.status).json(err.body)
    }
    const property = buildPropertyFromPayload(parsed.data)
    await addProperty(property)
    return res.status(201).json({ data: property })
  }

  return res.status(405).json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed" } })
}

