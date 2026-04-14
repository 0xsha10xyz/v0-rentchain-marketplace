import type { VercelRequest, VercelResponse } from "@vercel/node"

import { jsonError } from "../../src/lib/server/http.js"
import { getMarketplaceState } from "../../src/lib/server/marketplace-state.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed" } })
  }

  const id = String(req.query.id ?? "")
  const state = await getMarketplaceState()
  const property = state.properties.find((p) => p.id === id)
  if (!property) {
    const err = jsonError(404, "NOT_FOUND", "Property not found")
    return res.status(err.status).json(err.body)
  }
  return res.status(200).json({ data: property })
}

