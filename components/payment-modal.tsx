"use client"

import { useState } from "react"
import { Wallet, CheckCircle2, Loader2, X, Shield, Zap, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getOrCreateBrowserSessionId } from "@/lib/browser-session"
import { type Translations } from "@/lib/i18n"
import { type Property, formatPrice } from "@/lib/properties"

interface PaymentModalProps {
  property: Property | null
  t: Translations
  onClose: () => void
  onSuccess: (propertyId: string) => void
}

type ModalStep = "confirm" | "processing" | "success" | "error"

export function PaymentModal({ property, t, onClose, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<ModalStep>("confirm")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!property) return null

  const handleConfirm = async () => {
    setErrorMessage(null)
    setStep("processing")
    try {
      // Simulate chain confirmation latency before persisting the unlock server-side.
      await new Promise((resolve) => setTimeout(resolve, 2200))
      const sessionId = getOrCreateBrowserSessionId()
      if (!sessionId) {
        throw new Error("Session unavailable — try again in the browser.")
      }
      const res = await fetch("/api/unlocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: property.id, sessionId }),
      })
      const payload: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        const message =
          payload &&
          typeof payload === "object" &&
          "error" in payload &&
          payload.error &&
          typeof payload.error === "object" &&
          "message" in payload.error &&
          typeof (payload.error as { message: unknown }).message === "string"
            ? (payload.error as { message: string }).message
            : "Could not confirm unlock"
        throw new Error(message)
      }
      setStep("success")
      onSuccess(property.id)
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Something went wrong")
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.paymentNetwork}</span>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    <span className="font-medium text-foreground text-xs">Solana Mainnet</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Protocol</span>
                  <span className="font-medium text-foreground text-xs">X402 Pay-per-Click</span>
                </div>
              </div>

              <div className="pt-1 text-xs text-muted-foreground bg-secondary rounded-lg px-3 py-2 flex items-start gap-2">
                <Zap className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <span>Transaction is processed instantly on Solana with near-zero fees via X402 protocol.</span>
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
              <p className="font-semibold text-foreground">Processing on Solana...</p>
              <p className="text-xs text-muted-foreground mt-1">Confirming X402 micropayment</p>
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
              <p className="text-xs text-muted-foreground">Full Address:</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{property.fullAddress}</p>
              <p className="text-xs text-muted-foreground mt-2">Exact Price:</p>
              <p className="text-sm font-bold text-primary mt-0.5">{formatPrice(property.price)}/bulan</p>
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
              <h3 className="font-bold text-lg text-foreground">Unlock failed</h3>
              <p className="text-sm text-muted-foreground mt-1">{errorMessage ?? "Please try again."}</p>
            </div>
            <div className="flex w-full gap-2">
              <Button variant="outline" onClick={handleDone} className="flex-1 text-sm">
                {t.paymentCancel}
              </Button>
              <Button onClick={handleRetry} className="flex-1 text-sm bg-primary hover:bg-primary/90">
                Retry
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
