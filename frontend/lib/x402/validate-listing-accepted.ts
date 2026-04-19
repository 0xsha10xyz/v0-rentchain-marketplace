import type { X402AppConfig } from "@/lib/x402/config"

const SOLANA_MAINNET_CAIP2 = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"
const SOLANA_DEVNET_CAIP2 = "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"

function expectedCaip2(network: X402AppConfig["network"]): string {
  return network === "solana" ? SOLANA_MAINNET_CAIP2 : SOLANA_DEVNET_CAIP2
}

export function assertListingAcceptedMatchesConfig(
  accepted: Record<string, unknown>,
  config: X402AppConfig,
  expectedAmountAtomic: string
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
    return { ok: false, message: "Token mint does not match this listing payment" }
  }
  const amountRaw = accepted.amount ?? accepted.maxAmountRequired
  if (amountRaw === undefined || amountRaw === null) {
    return { ok: false, message: "Missing payment amount" }
  }
  if (String(amountRaw) !== String(expectedAmountAtomic)) {
    return { ok: false, message: "Listing fee does not match selected duration" }
  }
  return { ok: true }
}
