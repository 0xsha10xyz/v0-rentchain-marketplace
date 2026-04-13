import { X402PaymentHandler } from "x402-solana/server"

import { getX402AppConfig } from "@/lib/x402/config"

export function createX402PaymentHandler(): X402PaymentHandler {
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
