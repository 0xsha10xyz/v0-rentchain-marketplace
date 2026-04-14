import { clusterApiUrl } from "@solana/web3.js"

/**
 * Solana clients require RPC URLs with an `http:` or `https:` scheme.
 * Deployment envs are often pasted as `mainnet.helius-rpc.com/?api-key=…` without `https://`.
 */
export function normalizeHttpRpcUrl(raw: string | undefined): string | undefined {
  const t = raw?.trim()
  if (!t) return undefined
  const withScheme = /^https?:\/\//i.test(t) ? t : `https://${t}`
  try {
    const u = new URL(withScheme)
    if (u.protocol === "http:" || u.protocol === "https:") return withScheme
  } catch {
    /* ignore */
  }
  return undefined
}

/**
 * Browser RPC for wallet adapter + x402 client. Public mainnet-beta often returns 403 from the
 * browser; set `NEXT_PUBLIC_SOLANA_RPC_URL` (e.g. Helius) in production.
 */
export function resolveBrowserSolanaRpcUrl(isMainnet: boolean): string {
  const normalized = normalizeHttpRpcUrl(process.env.NEXT_PUBLIC_SOLANA_RPC_URL)
  if (normalized) return normalized
  return clusterApiUrl(isMainnet ? "mainnet-beta" : "devnet")
}
