import type { Router } from "express"
import { z } from "zod"

import { jsonError } from "../lib/server/http.js"
import { appendUnlock, getMarketplaceState } from "../lib/server/marketplace-state.js"
import { getX402AppConfig } from "../lib/x402/config.js"
import { createX402PaymentHandler } from "../lib/x402/handler.js"

const bodySchema = z.object({
  propertyId: z.string().min(1).max(64),
  sessionId: z.string().uuid(),
})

export function registerPaymentRoutes(router: Router) {
  router.post("/payments/unlock", async (req, res) => {
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
    const resourceUrl = `${config.appBaseUrl}/payments/unlock`

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

    const paymentRequirements = await x402.createPaymentRequirements(
      {
        amount: config.unlockPriceAtomic,
        asset: { address: config.usdcMint, decimals: 6 },
        description: config.unlockDescription,
      },
      resourceUrl
    )

    if (!paymentHeader) {
      const response = x402.create402Response(paymentRequirements, resourceUrl)
      return res.status(response.status).json(response.body)
    }

    const verified = await x402.verifyPayment(paymentHeader, paymentRequirements)
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

    const settlement = await x402.settlePayment(paymentHeader, paymentRequirements)
    if (!settlement.success) {
      // eslint-disable-next-line no-console
      console.error("[x402] settlement failed", settlement.errorReason)
    }

    return res.status(201).json({ data: record, mode: "x402" })
  })
}

