import { NextResponse, type NextRequest } from "next/server"

import { addProperty, buildPropertyFromPayload, getMarketplaceState } from "@/lib/server/marketplace-state"
import { jsonError } from "@/lib/server/http"
import { filterAndSortProperties } from "@/lib/server/property-query"
import { createPropertyBodySchema, propertyListQuerySchema } from "@/lib/server/schemas"
import { getX402AppConfig } from "@/lib/x402/config"
import {
  listingFeeAtomicUsdc,
  listingFeeDescription,
  type ListingDurationDays,
} from "@/lib/x402/listing-fees"

export const maxDuration = 30

export const runtime = "nodejs"

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

export async function POST(request: NextRequest) {
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

  const listingPayload = parsed.data
  const config = getX402AppConfig()
  const resourceUrl = `${config.appBaseUrl}/api/properties`
  const duration = listingPayload.adDurationDays as ListingDurationDays
  const feeAtomic = listingFeeAtomicUsdc(duration)

  if (!config.paymentsEnabled) {
    const property = buildPropertyFromPayload(listingPayload)
    await addProperty(property)
    return NextResponse.json({ data: property, mode: "demo" as const }, { status: 201 })
  }

  const [{ safeBase64Encode }, { createX402PaymentHandler }, { assertListingAcceptedMatchesConfig }, { parsePaymentSignatureAccepted }] =
    await Promise.all([
      import("@payai/x402/utils"),
      import("@/lib/x402/handler"),
      import("@/lib/x402/validate-listing-accepted"),
      import("@/lib/x402/validate-unlock-accepted"),
    ])

  const x402 = await createX402PaymentHandler()
  const paymentHeader = x402.extractPayment(request.headers)

  if (!paymentHeader) {
    const paymentRequirements = await x402.createPaymentRequirements(
      {
        amount: feeAtomic,
        asset: {
          address: config.usdcMint,
          decimals: 6,
        },
        description: listingFeeDescription(duration),
      },
      resourceUrl
    )
    const response = x402.create402Response(paymentRequirements, resourceUrl)
    const resBody = response.body
    const paymentRequired = safeBase64Encode(JSON.stringify(resBody))
    return NextResponse.json(resBody, {
      status: response.status,
      headers: { "PAYMENT-REQUIRED": paymentRequired },
    })
  }

  const paymentParsed = parsePaymentSignatureAccepted(paymentHeader)
  if (!paymentParsed.ok) {
    return jsonError(400, "INVALID_PAYMENT_HEADER", paymentParsed.message)
  }

  const policy = assertListingAcceptedMatchesConfig(paymentParsed.accepted, config, feeAtomic)
  if (!policy.ok) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_PAYMENT",
          message: policy.message,
          reason: "policy_mismatch",
        },
      },
      { status: 402 }
    )
  }

  const verified = await x402.verifyPayment(paymentHeader, paymentParsed.accepted as never)
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

  let property
  try {
    property = buildPropertyFromPayload(listingPayload)
    await addProperty(property)
  } catch {
    return jsonError(500, "LISTING_FAILED", "Could not save listing after payment verification")
  }

  const settlement = await x402.settlePayment(paymentHeader, paymentParsed.accepted as never)
  if (!settlement.success) {
    console.error("[x402] listing settlement failed", settlement.errorReason)
  }

  return NextResponse.json({ data: property, mode: "x402" as const }, { status: 201 })
}
