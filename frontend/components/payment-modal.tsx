"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { createX402Client } from "x402-solana/client"
import { Wallet, CheckCircle2, Loader2, X, Shield, Zap, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getOrCreateBrowserSessionId } from "@/lib/browser-session"
import { type Translations } from "@/lib/i18n"
import { type Property, formatPrice } from "@/lib/properties"
import { resolveBrowserSolanaRpcUrl } from "@/lib/solana-endpoint"
import { getX402ClientNetwork } from "@/lib/x402/browser-network"
import { UNLOCK_PRICE_ATOMIC } from "@/lib/x402/config"

interface PaymentModalProps {
  property: Property | null
  t: Translations
  onClose: () => void
  onSuccess: (propertyId: string) => void
}

type ModalStep = "confirm" | "processing" | "success" | "error"

function errorMessageFromJson(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback
  if ("error" in payload && payload.error && typeof payload.error === "object") {
    const err = payload.error as { message?: unknown; reason?: unknown }
    const message = typeof err.message === "string" ? err.message : fallback
    const reason = typeof err.reason === "string" ? err.reason.trim() : ""
    if (reason && reason !== message) {
      return `${message} (${reason})`
    }
    return message
  }
  return fallback
}

export function PaymentModal({ property, t, onClose, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<ModalStep>("confirm")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const wallet = useWallet()

  if (!property) return null

  const handleConfirm = async () => {
    setErrorMessage(null)
    setStep("processing")
    try {
      const sessionId = getOrCreateBrowserSessionId()
      if (!sessionId) {
        throw new Error(t.sessionUnavailable)
      }

      const url = new URL("/api/payments/unlock", window.location.origin).toString()
      const init: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: property.id, sessionId }),
      }

      const walletReady =
        wallet.connected &&
        wallet.publicKey &&
        typeof wallet.signTransaction === "function"

      let res: Response
      if (walletReady) {
        const x402Network = getX402ClientNetwork()
        const client = createX402Client({
          wallet: {
            address: wallet.publicKey!.toBase58(),
            signTransaction: async (tx) => wallet.signTransaction!(tx),
          },
          network: x402Network,
          rpcUrl: resolveBrowserSolanaRpcUrl(x402Network === "solana"),
          amount: BigInt(
            process.env.NEXT_PUBLIC_X402_UNLOCK_PRICE_ATOMIC?.trim() || UNLOCK_PRICE_ATOMIC
          ),
        })
        res = await client.fetch(url, init)
      } else {
        res = await fetch(url, init)
      }

      const payload: unknown = await res.json().catch(() => null)

      if (res.ok) {
        setStep("success")
        onSuccess(property.id)
        return
      }

      if (res.status === 402) {
        if (!walletReady) {
          throw new Error(t.connectWallet)
        }
        throw new Error(errorMessageFromJson(payload, t.paymentUnlockServerError))
      }

      throw new Error(errorMessageFromJson(payload, t.paymentUnlockServerError))
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : t.paymentUnknownError)
      setStep("error")
    }
  }

  const handleDone = () => {
    onClose()
    setStep("confirm")
    setErrorMessage(null)
  }

  const handleRetry = () => {
    setErrorMessage(null)
    setStep("confirm")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={step === "confirm" ? onClose : undefined} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-sm border border-border overflow-hidden">

        {step === "confirm" && (
          <>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
              <div>
                <h2 className="font-bold text-base text-foreground">{t.paymentTitle}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{t.paymentDesc}</p>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Property preview */}
              <div className="bg-secondary rounded-xl p-4 flex gap-3 items-start">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{property.type}</p>
                  <p className="text-sm font-semibold text-foreground truncate">{property.title}</p>
                  <p className="text-xs text-muted-foreground">{property.location}</p>
                </div>
              </div>

              {/* Payment details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.paymentAmount}</span>
                  <span className="font-bold text-foreground">0.1 USDC</span>
                </div>
                <div className="text-xs text-muted-foreground">{t.paymentNetwork}</div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.paymentProtocol}</span>
                  <span className="font-medium text-foreground text-xs">{t.paymentProtocolValue}</span>
                </div>
              </div>

              <div className="pt-1 text-xs text-muted-foreground bg-secondary rounded-lg px-3 py-2 flex items-start gap-2">
                <Zap className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <span>{t.paymentInstantNote}</span>
              </div>
            </div>

            <div className="px-5 pb-5 flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1 text-sm">
                {t.paymentCancel}
              </Button>
              <Button onClick={handleConfirm} className="flex-1 text-sm bg-primary hover:bg-primary/90">
                <Wallet className="w-4 h-4 mr-1.5" />
                {t.paymentConfirm}
              </Button>
            </div>
          </>
        )}

        {step === "processing" && (
          <div className="px-5 py-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{t.paymentProcessing}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.paymentProcessingHint}</p>
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-[progress_2.2s_ease-in-out_forwards]" style={{ width: "100%" }} />
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="px-5 py-8 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">{t.paymentSuccess}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t.paymentSuccessDesc}</p>
            </div>
            <div className="bg-secondary rounded-xl p-3 w-full text-left">
              <p className="text-xs text-muted-foreground">{t.paymentFullAddress}</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{property.fullAddress}</p>
              <p className="text-xs text-muted-foreground mt-2">{t.paymentExactPrice}</p>
              <p className="text-sm font-bold text-primary mt-0.5">
                {formatPrice(property.price)}
                {t.perMonth}
              </p>
            </div>
            <Button onClick={handleDone} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              {t.viewDetails}
            </Button>
          </div>
        )}

        {step === "error" && (
          <div className="px-5 py-8 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-9 h-9 text-destructive" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">{t.paymentUnlockFailed}</h3>
              <p className="text-sm text-muted-foreground mt-1">{errorMessage ?? t.paymentErrorHint}</p>
            </div>
            <div className="flex w-full gap-2">
              <Button variant="outline" onClick={handleDone} className="flex-1 text-sm">
                {t.paymentCancel}
              </Button>
              <Button onClick={handleRetry} className="flex-1 text-sm bg-primary hover:bg-primary/90">
                {t.paymentTryAgain}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
