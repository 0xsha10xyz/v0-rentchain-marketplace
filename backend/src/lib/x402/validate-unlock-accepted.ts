import type { X402AppConfig } from "./config.js"

const SOLANA_MAINNET_CAIP2 = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"
const SOLANA_DEVNET_CAIP2 = "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"

function expectedCaip2(network: X402AppConfig["network"]): string {
  return network === "solana" ? SOLANA_MAINNET_CAIP2 : SOLANA_DEVNET_CAIP2
}

export function parsePaymentSignatureAccepted(
  paymentHeader: string
): { ok: true; accepted: Record<string, unknown> } | { ok: false; message: string } {
  let decoded: unknown
  try {
    decoded = JSON.parse(Buffer.from(paymentHeader, "base64").toString("utf8"))
  } catch {
    return { ok: false, message: "Invalid PAYMENT-SIGNATURE encoding" }
  }
  if (!decoded || typeof decoded !== "object") {
    return { ok: false, message: "Invalid payment payload" }
  }
  const accepted = (decoded as { accepted?: unknown }).accepted
  if (!accepted || typeof accepted !== "object" || Array.isArray(accepted)) {
    return { ok: false, message: "Missing accepted payment requirements" }
  }
  return { ok: true, accepted: accepted as Record<string, unknown> }
}

export function assertUnlockAcceptedMatchesConfig(
  accepted: Record<string, unknown>,
  config: X402AppConfig
): { ok: true } | { ok: false; message: string } {
  if (accepted.scheme !== "exact") {
    return { ok: false, message: "Unsupported payment scheme" }
  }
  if (accepted.network !== expectedCaip2(config.network)) {
    return { ok: false, message: "Wrong Solana network for this deployment" }
  }
  if (typeof accepted.payTo !== "string" || accepted.payTo !== config.treasuryAddress) {
    return { ok: false, message: "Treasury recipient does not match this server" }
  }
  const asset = accepted.asset
  if (typeof asset !== "string" || asset !== config.usdcMint) {
    return { ok: false, message: "Token mint does not match this unlock" }
  }
  const amountRaw = accepted.amount ?? accepted.maxAmountRequired
  if (amountRaw === undefined || amountRaw === null) {
    return { ok: false, message: "Missing payment amount" }
  }
  if (String(amountRaw) !== String(config.unlockPriceAtomic)) {
    return { ok: false, message: "Unlock price does not match server configuration" }
  }
  return { ok: true }
}
