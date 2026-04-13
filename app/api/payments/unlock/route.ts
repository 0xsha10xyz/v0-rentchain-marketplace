import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { appendUnlock, getMarketplaceState } from "@/lib/server/marketplace-state"
import { jsonError } from "@/lib/server/http"
import { getX402AppConfig } from "@/lib/x402/config"
import { createX402PaymentHandler } from "@/lib/x402/handler"

export const runtime = "nodejs"

const bodySchema = z.object({
  propertyId: z.string().min(1).max(64),
  sessionId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError(400, "INVALID_JSON", "Request body must be JSON")
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return jsonError(400, "INVALID_BODY", "Invalid payload", parsed.error.flatten())
  }

  const { propertyId, sessionId } = parsed.data

  const snapshot = await getMarketplaceState()
  if (!snapshot.properties.some((p) => p.id === propertyId)) {
    return jsonError(404, "NOT_FOUND", "Property not found")
  }

  const config = getX402AppConfig()
  const resourceUrl = `${config.appBaseUrl}/api/payments/unlock`

  if (!config.paymentsEnabled) {
    try {
      const record = await appendUnlock(propertyId, sessionId)
      return NextResponse.json({ data: record, mode: "demo" as const }, { status: 201 })
    } catch {
      return jsonError(500, "UNLOCK_FAILED", "Could not record unlock")
    }
  }

  const x402 = createX402PaymentHandler()
  const paymentHeader = x402.extractPayment(request.headers)

  const paymentRequirements = await x402.createPaymentRequirements(
    {
      amount: config.unlockPriceAtomic,
      asset: {
        address: config.usdcMint,
        decimals: 6,
      },
      description: config.unlockDescription,
    },
    resourceUrl
  )

  if (!paymentHeader) {
    const response = x402.create402Response(paymentRequirements, resourceUrl)
    return NextResponse.json(response.body, { status: response.status })
  }

  const verified = await x402.verifyPayment(paymentHeader, paymentRequirements)
  if (!verified.isValid) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_PAYMENT",
          message: "Invalid payment",
          reason: verified.invalidReason,
        },
      },
      { status: 402 }
    )
  }

  let record
  try {
    record = await appendUnlock(propertyId, sessionId)
  } catch {
    return jsonError(500, "UNLOCK_FAILED", "Could not record unlock after payment verification")
  }

  const settlement = await x402.settlePayment(paymentHeader, paymentRequirements)
  if (!settlement.success) {
    console.error("[x402] settlement failed", settlement.errorReason)
  }

  return NextResponse.json({ data: record, mode: "x402" as const }, { status: 201 })
}
