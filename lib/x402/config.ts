import { normalizeHttpRpcUrl } from "@/lib/solana-endpoint"

/**
 * Central x402 (HTTP 402 + USDC on Solana) configuration.
 *
 * **Production:** set `TREASURY_WALLET_ADDRESS` to your merchant vault, `NEXT_PUBLIC_APP_URL`
 * to the public site origin, and `NEXT_PUBLIC_SOLANA_NETWORK` to `solana` or `solana-devnet`.
 *
 * **Local demo (no USDC):** leave `TREASURY_WALLET_ADDRESS` unset — `/api/payments/unlock` records
 * unlocks without requesting on-chain payment (same behaviour as the legacy unlock route).
 */

export type SolanaNetworkSimple = "solana" | "solana-devnet"

const USDC_MAINNET = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
const USDC_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"

/** 0.1 USDC, 6 decimals */
export const UNLOCK_PRICE_ATOMIC = "100000"

export interface X402AppConfig {
  /** When true, `POST /api/payments/unlock` issues HTTP 402 until a valid `PAYMENT-SIGNATURE` is sent. */
  paymentsEnabled: boolean
  network: SolanaNetworkSimple
  treasuryAddress: string
  facilitatorUrl: string
  rpcUrl?: string
  appBaseUrl: string
  usdcMint: string
  /** Atomic units (string) for one property unlock. */
  unlockPriceAtomic: string
  unlockDescription: string
}

function trimEnv(key: string): string | undefined {
  const v = process.env[key]?.trim()
  return v && v.length > 0 ? v : undefined
}

function resolveBaseUrl(): string {
  const explicit = trimEnv("NEXT_PUBLIC_APP_URL")
  if (explicit) return explicit
  const vercel = trimEnv("VERCEL_URL")
  if (vercel) {
    return vercel.startsWith("http") ? vercel : `https://${vercel}`
  }
  return "http://localhost:3000"
}

function resolveNetwork(): SolanaNetworkSimple {
  const n = trimEnv("NEXT_PUBLIC_SOLANA_NETWORK")?.toLowerCase()
  return n === "solana" || n === "mainnet" || n === "mainnet-beta" ? "solana" : "solana-devnet"
}

export function getX402AppConfig(): X402AppConfig {
  const network = resolveNetwork()
  const treasury = trimEnv("TREASURY_WALLET_ADDRESS") ?? ""

  return {
    paymentsEnabled: treasury.length > 0,
    network,
    treasuryAddress: treasury,
    facilitatorUrl: trimEnv("X402_FACILITATOR_URL") ?? "https://facilitator.payai.network",
    rpcUrl:
      normalizeHttpRpcUrl(trimEnv("NEXT_PUBLIC_SOLANA_RPC_URL")) ??
      normalizeHttpRpcUrl(trimEnv("SOLANA_RPC_URL")),
    appBaseUrl: resolveBaseUrl().replace(/\/$/, ""),
    usdcMint: trimEnv("NEXT_PUBLIC_USDC_MINT") ?? (network === "solana" ? USDC_MAINNET : USDC_DEVNET),
    unlockPriceAtomic: trimEnv("X402_UNLOCK_PRICE_ATOMIC") ?? UNLOCK_PRICE_ATOMIC,
    unlockDescription: trimEnv("X402_UNLOCK_DESCRIPTION") ?? "RentChain property detail unlock",
  }
}
