/** Solana network id understood by `x402-solana` client (must match server `NEXT_PUBLIC_SOLANA_NETWORK`). */
export function getX402ClientNetwork(): "solana" | "solana-devnet" {
  const n = process.env.NEXT_PUBLIC_SOLANA_NETWORK?.toLowerCase()
  return n === "solana" || n === "mainnet" || n === "mainnet-beta" ? "solana" : "solana-devnet"
}
