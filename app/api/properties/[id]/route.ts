import { getMarketplaceState } from "@/lib/server/marketplace-state"
import { jsonError } from "@/lib/server/http"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteParams) {
  const { id } = await context.params
  const state = await getMarketplaceState()
  const property = state.properties.find((p) => p.id === id)
  if (!property) {
    return jsonError(404, "NOT_FOUND", "Property not found")
  }
  return Response.json({ data: property })
}
