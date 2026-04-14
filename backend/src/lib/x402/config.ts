import { normalizeHttpRpcUrl } from "../solana-endpoint.js"

export type SolanaNetworkSimple = "solana" | "solana-devnet"

const USDC_MAINNET = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
const USDC_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"

/** 0.1 USDC, 6 decimals */
export const UNLOCK_PRICE_ATOMIC = "100000"

export interface X402AppConfig {
  paymentsEnabled: boolean
  network: SolanaNetworkSimple
  treasuryAddress: string
  facilitatorUrl: string
  rpcUrl?: string
  appBaseUrl: string
  usdcMint: string
  unlockPriceAtomic: string
  unlockDescription: string
}

function trimEnv(key: string): string | undefined {
  const v = process.env[key]?.trim()
  return v && v.length > 0 ? v : undefined
}

function resolveBaseUrl(): string {
  const explicit = trimEnv("APP_URL") ?? trimEnv("NEXT_PUBLIC_APP_URL")
  if (explicit) return explicit
  return "http://localhost:3000"
}

function resolveNetwork(): SolanaNetworkSimple {
  const n = trimEnv("SOLANA_NETWORK") ?? trimEnv("NEXT_PUBLIC_SOLANA_NETWORK")
  const v = n?.toLowerCase()
  return v === "solana" || v === "mainnet" || v === "mainnet-beta" ? "solana" : "solana-devnet"
}

export function getX402AppConfig(): X402AppConfig {
  const network = resolveNetwork()
  const treasury = trimEnv("TREASURY_WALLET_ADDRESS") ?? ""

  return {
    paymentsEnabled: treasury.length > 0,
    network,
    treasuryAddress: treasury,
    facilitatorUrl: trimEnv("X402_FACILITATOR_URL") ?? "https://facilitator.payai.network",
    rpcUrl: normalizeHttpRpcUrl(trimEnv("SOLANA_RPC_URL") ?? trimEnv("NEXT_PUBLIC_SOLANA_RPC_URL")),
    appBaseUrl: resolveBaseUrl().replace(/\/$/, ""),
    usdcMint: trimEnv("USDC_MINT") ?? trimEnv("NEXT_PUBLIC_USDC_MINT") ?? (network === "solana" ? USDC_MAINNET : USDC_DEVNET),
    unlockPriceAtomic: trimEnv("X402_UNLOCK_PRICE_ATOMIC") ?? UNLOCK_PRICE_ATOMIC,
    unlockDescription: trimEnv("X402_UNLOCK_DESCRIPTION") ?? "RentChain property detail unlock",
  }
}

