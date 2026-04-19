import type { X402PaymentHandler } from "x402-solana/server"

import { getX402AppConfig } from "@/lib/x402/config"

/** Loads `x402-solana/server` lazily so API routes do not pull it into unrelated bundles. */
export async function createX402PaymentHandler(): Promise<X402PaymentHandler> {
  const { X402PaymentHandler } = await import("x402-solana/server")
  const c = getX402AppConfig()
  if (!c.paymentsEnabled) {
    throw new Error("X402PaymentHandler requires TREASURY_WALLET_ADDRESS")
  }
  const apiKeyId = process.env.PAYAI_API_KEY_ID?.trim()
  const apiKeySecret = process.env.PAYAI_API_KEY_SECRET?.trim()

  return new X402PaymentHandler({
    network: c.network,
    treasuryAddress: c.treasuryAddress,
    facilitatorUrl: c.facilitatorUrl,
    rpcUrl: c.rpcUrl,
    ...(apiKeyId && apiKeySecret ? { apiKeyId, apiKeySecret } : {}),
  })
}
