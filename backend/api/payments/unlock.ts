import { safeBase64Encode } from "@payai/x402/utils"
import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"

import { jsonError } from "../../src/lib/server/http.js"
import { appendUnlock, getMarketplaceState } from "../../src/lib/server/marketplace-state.js"
import { getX402AppConfig } from "../../src/lib/x402/config.js"
import { createX402PaymentHandler } from "../../src/lib/x402/handler.js"
import {
  assertUnlockAcceptedMatchesConfig,
  parsePaymentSignatureAccepted,
} from "../../src/lib/x402/validate-unlock-accepted.js"

const bodySchema = z.object({
  propertyId: z.string().min(1).max(64),
  sessionId: z.string().uuid(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed" } })
  }

  const parsed = bodySchema.safeParse(req.body)
  if (!parsed.success) {
    const err = jsonError(400, "INVALID_BODY", "Invalid payload", parsed.error.flatten())
    return res.status(err.status).json(err.body)
  }

  const { propertyId, sessionId } = parsed.data

  const snapshot = await getMarketplaceState()
  if (!snapshot.properties.some((p) => p.id === propertyId)) {
    const err = jsonError(404, "NOT_FOUND", "Property not found")
    return res.status(err.status).json(err.body)
  }

  const config = getX402AppConfig()
  const resourceUrl = `${config.appBaseUrl}/api/payments/unlock`

  if (!config.paymentsEnabled) {
    try {
      const record = await appendUnlock(propertyId, sessionId)
      return res.status(201).json({ data: record, mode: "demo" })
    } catch {
      const err = jsonError(500, "UNLOCK_FAILED", "Could not record unlock")
      return res.status(err.status).json(err.body)
    }
  }

  const x402 = createX402PaymentHandler()
  const paymentHeader = x402.extractPayment(req.headers as Record<string, string | string[] | undefined>)

  if (!paymentHeader) {
    const paymentRequirements = await x402.createPaymentRequirements(
      {
        amount: config.unlockPriceAtomic,
        asset: { address: config.usdcMint, decimals: 6 },
        description: config.unlockDescription,
      },
      resourceUrl
    )
    const response = x402.create402Response(paymentRequirements, resourceUrl)
    const body = response.body
    res.setHeader("PAYMENT-REQUIRED", safeBase64Encode(JSON.stringify(body)))
    return res.status(response.status).json(body)
  }

  const paymentParsed = parsePaymentSignatureAccepted(paymentHeader)
  if (!paymentParsed.ok) {
    const err = jsonError(400, "INVALID_PAYMENT_HEADER", paymentParsed.message)
    return res.status(err.status).json(err.body)
  }
  const policy = assertUnlockAcceptedMatchesConfig(paymentParsed.accepted, config)
  if (!policy.ok) {
    return res.status(402).json({
      error: { code: "INVALID_PAYMENT", message: policy.message, reason: "policy_mismatch" },
    })
  }

  const verified = await x402.verifyPayment(paymentHeader, paymentParsed.accepted as never)
  if (!verified.isValid) {
    return res.status(402).json({
      error: { code: "INVALID_PAYMENT", message: "Invalid payment", reason: verified.invalidReason },
    })
  }

  let record
  try {
    record = await appendUnlock(propertyId, sessionId)
  } catch {
    const err = jsonError(500, "UNLOCK_FAILED", "Could not record unlock after payment verification")
    return res.status(err.status).json(err.body)
  }

  const settlement = await x402.settlePayment(paymentHeader, paymentParsed.accepted as never)
  if (!settlement.success) {
    // eslint-disable-next-line no-console
    console.error("[x402] settlement failed", settlement.errorReason)
  }

  return res.status(201).json({ data: record, mode: "x402" })
}

