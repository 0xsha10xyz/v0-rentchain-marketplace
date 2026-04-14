import type { Router } from "express"

import { jsonError } from "../lib/server/http.js"
import { appendUnlock, hasUnlockForSession, listUnlockedPropertyIdsForSession } from "../lib/server/marketplace-state.js"
import { unlockBodySchema, unlockListQuerySchema } from "../lib/server/schemas.js"

export function registerUnlockRoutes(router: Router) {
  router.get("/unlocks", async (req, res) => {
    const parsed = unlockListQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      const err = jsonError(400, "INVALID_QUERY", "sessionId (UUID) is required", parsed.error.flatten())
      return res.status(err.status).json(err.body)
    }

    const { sessionId, propertyId } = parsed.data
    if (propertyId) {
      const unlocked = await hasUnlockForSession(propertyId, sessionId)
      return res.json({ data: { unlocked, propertyId } })
    }

    const propertyIds = await listUnlockedPropertyIdsForSession(sessionId)
    return res.json({ data: { propertyIds } })
  })

  router.post("/unlocks", async (req, res) => {
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
  })
}

