"use client"

import { useMemo, type ReactNode } from "react"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom"
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare"
import { resolveBrowserSolanaRpcUrl } from "@/lib/solana-endpoint"

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

  const endpoint = useMemo(
    () => resolveBrowserSolanaRpcUrl(network === WalletAdapterNetwork.Mainnet),
    [network]
  )

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
