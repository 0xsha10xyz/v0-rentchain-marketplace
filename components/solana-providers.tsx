"use client"

import { useMemo, type ReactNode } from "react"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { clusterApiUrl } from "@solana/web3.js"

import "@solana/wallet-adapter-react-ui/styles.css"

interface SolanaProvidersProps {
  children: ReactNode
}

export function SolanaProviders({ children }: SolanaProvidersProps) {
  const network = useMemo(() => {
    const n = process.env.NEXT_PUBLIC_SOLANA_NETWORK?.toLowerCase()
    return n === "solana" || n === "mainnet" || n === "mainnet-beta"
      ? WalletAdapterNetwork.Mainnet
      : WalletAdapterNetwork.Devnet
  }, [])

  const endpoint = useMemo(() => {
    const custom = process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim()
    if (custom) return custom
    return clusterApiUrl(network === WalletAdapterNetwork.Mainnet ? "mainnet-beta" : "devnet")
  }, [network])

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
