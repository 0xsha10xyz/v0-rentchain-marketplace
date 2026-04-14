import {
  appendUnlock,
  hasUnlockForSession,
  listUnlockedPropertyIdsForSession,
} from "@/lib/server/marketplace-state"
import { jsonError } from "@/lib/server/http"
import { unlockBodySchema, unlockListQuerySchema } from "@/lib/server/schemas"

export async function GET(request: Request) {
  const params = unlockListQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams.entries())
  )
  if (!params.success) {
    return jsonError(400, "INVALID_QUERY", "sessionId (UUID) is required", params.error.flatten())
  }

  const { sessionId, propertyId } = params.data
  if (propertyId) {
    const unlocked = await hasUnlockForSession(propertyId, sessionId)
    return Response.json({ data: { unlocked, propertyId } })
  }

  const propertyIds = await listUnlockedPropertyIdsForSession(sessionId)
  return Response.json({ data: { propertyIds } })
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError(400, "INVALID_JSON", "Request body must be JSON")
  }

  const parsed = unlockBodySchema.safeParse(body)
  if (!parsed.success) {
    return jsonError(400, "INVALID_BODY", "Invalid unlock payload", parsed.error.flatten())
  }

  try {
    const record = await appendUnlock(parsed.data.propertyId, parsed.data.sessionId)
    return Response.json({ data: record }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message === "PROPERTY_NOT_FOUND") {
      return jsonError(404, "NOT_FOUND", "Property not found")
    }
    return jsonError(500, "UNLOCK_FAILED", "Could not record unlock")
  }
}
