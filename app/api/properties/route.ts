import { addProperty, buildPropertyFromPayload, getMarketplaceState } from "@/lib/server/marketplace-state"
import { jsonError } from "@/lib/server/http"
import { filterAndSortProperties } from "@/lib/server/property-query"
import { createPropertyBodySchema, propertyListQuerySchema } from "@/lib/server/schemas"

function parseListQuery(searchParams: URLSearchParams) {
  const raw: Record<string, string | string[] | undefined> = {}
  for (const [key, value] of searchParams.entries()) {
    if (key === "facilities") {
      const existing = raw.facilities
      if (Array.isArray(existing)) {
        existing.push(value)
      } else if (typeof existing === "string") {
        raw.facilities = [existing, value]
      } else {
        raw.facilities = value
      }
      continue
    }
    raw[key] = value
  }
  return propertyListQuerySchema.safeParse(raw)
}

export async function GET(request: Request) {
  const parsed = parseListQuery(new URL(request.url).searchParams)
  if (!parsed.success) {
    return jsonError(400, "INVALID_QUERY", "Invalid query parameters", parsed.error.flatten())
  }

  const state = await getMarketplaceState()
  const data = filterAndSortProperties(state.properties, parsed.data)

  return Response.json({
    data,
    meta: { total: data.length },
  })
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError(400, "INVALID_JSON", "Request body must be JSON")
  }

  const parsed = createPropertyBodySchema.safeParse(body)
  if (!parsed.success) {
    return jsonError(400, "INVALID_BODY", "Invalid listing payload", parsed.error.flatten())
  }

  const property = buildPropertyFromPayload(parsed.data)
  await addProperty(property)

  return Response.json({ data: property }, { status: 201 })
}
