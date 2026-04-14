import type { VercelRequest, VercelResponse } from "@vercel/node"

import { jsonError } from "../src/lib/server/http.js"
import { appendUnlock, hasUnlockForSession, listUnlockedPropertyIdsForSession } from "../src/lib/server/marketplace-state.js"
import { unlockBodySchema, unlockListQuerySchema } from "../src/lib/server/schemas.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const parsed = unlockListQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      const err = jsonError(400, "INVALID_QUERY", "sessionId (UUID) is required", parsed.error.flatten())
      return res.status(err.status).json(err.body)
    }

    const { sessionId, propertyId } = parsed.data
    if (propertyId) {
      const unlocked = await hasUnlockForSession(propertyId, sessionId)
      return res.status(200).json({ data: { unlocked, propertyId } })
    }

    const propertyIds = await listUnlockedPropertyIdsForSession(sessionId)
    return res.status(200).json({ data: { propertyIds } })
  }

  if (req.method === "POST") {
    const parsed = unlockBodySchema.safeParse(req.body)
    if (!parsed.success) {
      const err = jsonError(400, "INVALID_BODY", "Invalid unlock payload", parsed.error.flatten())
      return res.status(err.status).json(err.body)
    }

    try {
      const record = await appendUnlock(parsed.data.propertyId, parsed.data.sessionId)
      return res.status(201).json({ data: record })
    } catch (e) {
      if (e instanceof Error && e.message === "PROPERTY_NOT_FOUND") {
        const err = jsonError(404, "NOT_FOUND", "Property not found")
        return res.status(err.status).json(err.body)
      }
      const err = jsonError(500, "UNLOCK_FAILED", "Could not record unlock")
      return res.status(err.status).json(err.body)
    }
  }

  return res.status(405).json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed" } })
}

