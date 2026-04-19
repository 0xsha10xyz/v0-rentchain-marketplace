import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    "x402-solana",
    "@solana/wallet-adapter-base",
    "@solana/wallet-adapter-phantom",
    "@solana/wallet-adapter-react",
    "@solana/wallet-adapter-react-ui",
    "@solana/wallet-adapter-solflare",
  ],
  webpack: (config) => {
    // WalletConnect/ws optional native deps are sometimes resolved to a nested path that
    // does not exist after npm dedupe on Windows — force the hoisted copies.
    config.resolve.alias = {
      ...config.resolve.alias,
      "utf-8-validate": path.join(__dirname, "node_modules", "utf-8-validate"),
      bufferutil: path.join(__dirname, "node_modules", "bufferutil"),
    }
    return config
  },
}

export default nextConfig
