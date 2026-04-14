"use client"

import { useState } from "react"
import {
  Home,
  Store,
  KeyRound,
  Palmtree,
  Wallet,
  CheckCircle2,
  Loader2,
  Zap,
  Info,
  CalendarDays,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type Translations } from "@/lib/i18n"
import { cn } from "@/lib/utils"

interface LandlordPortalProps {
  t: Translations
}

type PropertyType = "Kost" | "Ruko" | "Kontrakan" | "Villa" | ""

const propertyTypeOptions = [
  { value: "Kost", label: "Kost (Kamar Kos)", icon: Home },
  { value: "Ruko", label: "Ruko (Shophouse)", icon: Store },
  { value: "Kontrakan", label: "Kontrakan (Rental House)", icon: KeyRound },
  { value: "Villa", label: "Villa", icon: Palmtree },
]

const facilityOptions = [
  { key: "wifi", label: "WiFi" },
  { key: "parking", label: "Parkir" },
  { key: "ac", label: "AC" },
  { key: "kitchen", label: "Dapur" },
  { key: "laundry", label: "Laundry" },
  { key: "security", label: "Keamanan 24 Jam" },
  { key: "pool", label: "Kolam Renang" },
  { key: "gym", label: "Gym / Fitnes" },
]

const durationOptions = [
  { days: 7, label: "7 Hari", price: "1 USDC" },
  { days: 14, label: "14 Hari", price: "2 USDC" },
  { days: 30, label: "30 Hari", price: "4 USDC" },
]

type FormStep = "form" | "processing" | "success"

export function LandlordPortal({ t }: LandlordPortalProps) {
  const [step, setStep] = useState<FormStep>("form")
  const [propertyType, setPropertyType] = useState<PropertyType>("")
  const [size, setSize] = useState("")
  const [price, setPrice] = useState("")
  const [facilities, setFacilities] = useState<string[]>([])
  const [address, setAddress] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [duration, setDuration] = useState(7)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const selectedDuration = durationOptions.find((d) => d.days === duration)!

  const toggleFacility = (key: string) => {
    setFacilities((prev) => prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key])
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!propertyType) errs.propertyType = "Pilih tipe properti"
    if (!size) errs.size = "Masukkan ukuran"
    if (!price) errs.price = "Masukkan harga sewa"
    if (!address) errs.address = "Masukkan alamat lengkap"
    if (!whatsapp) errs.whatsapp = "Masukkan nomor WhatsApp"
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setStep("processing")
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200))
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: propertyType,
          size: Number(size),
          price: Number(price),
          facilities,
          fullAddress: address,
          whatsapp,
        }),
      })
      const payload: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        const raw =
          payload && typeof payload === "object" && "error" in payload
            ? (payload as { error?: { message?: unknown } }).error?.message
            : undefined
        const message = typeof raw === "string" ? raw : undefined
        throw new Error(message ?? "Gagal menayangkan iklan")
      }
      setStep("success")
    } catch (err) {
      setStep("form")
      setErrors({
        submit: err instanceof Error ? err.message : "Gagal menayangkan iklan",
      })
    }
  }

  const handleReset = () => {
    setStep("form")
    setPropertyType("")
    setSize("")
    setPrice("")
    setFacilities([])
    setAddress("")
    setWhatsapp("")
    setDuration(7)
    setErrors({})
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left — Info */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground text-balance">{t.postYourListing}</h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{t.postSubtitle}</p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {[
              { num: 1, title: "Isi Detail Properti", desc: "Lengkapi form dengan informasi properti Anda" },
              { num: 2, title: "Pilih Durasi Iklan", desc: "Tentukan berapa lama iklan Anda tayang" },
              { num: 3, title: "Bayar via Solana", desc: "Konfirmasi pembayaran USDC di jaringan Solana" },
              { num: 4, title: "Iklan Aktif!", desc: "Properti Anda langsung terlihat oleh pencari" },
            ].map(({ num, title, desc }) => (
              <div key={num} className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {num}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing card */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <p className="text-sm font-bold text-foreground">Paket Iklan</p>
            </div>
            {durationOptions.map((opt) => (
              <div key={opt.days} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{opt.label}</span>
                <span className="font-semibold text-primary">{opt.price}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-primary/15 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">Pembayaran via Solana, biaya gas mendekati nol.</p>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="lg:col-span-2">
          {step === "form" && (
            <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-6">
              <h2 className="font-bold text-base text-foreground border-b border-border pb-4">{t.listingFormTitle}</h2>

              {/* Property Type */}
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-2">{t.propertyTypeLabel}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {propertyTypeOptions.map(({ value, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => { setPropertyType(value as PropertyType); setErrors({ ...errors, propertyType: "" }) }}
                      className={cn(
                        "flex flex-col items-center gap-2 py-3 px-2 rounded-xl border text-xs font-medium transition-all",
                        propertyType === value
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-secondary border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {value}
                    </button>
                  ))}
                </div>
                {errors.propertyType && <p className="text-xs text-destructive mt-1">{errors.propertyType}</p>}
              </div>

              {/* Size & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-2">{t.sizeSqm}</label>
                  <Input
                    type="number"
                    placeholder="e.g. 72"
                    value={size}
                    onChange={(e) => { setSize(e.target.value); setErrors({ ...errors, size: "" }) }}
                    className={cn("text-sm", errors.size && "border-destructive")}
                  />
                  {errors.size && <p className="text-xs text-destructive mt-1">{errors.size}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-2">{t.rentPrice}</label>
                  <Input
                    type="number"
                    placeholder="e.g. 3000000"
                    value={price}
                    onChange={(e) => { setPrice(e.target.value); setErrors({ ...errors, price: "" }) }}
                    className={cn("text-sm", errors.price && "border-destructive")}
                  />
                  {errors.price && <p className="text-xs text-destructive mt-1">{errors.price}</p>}
                </div>
              </div>

              {/* Facilities */}
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-2">{t.facilitiesLabel}</label>
                <div className="flex flex-wrap gap-2">
                  {facilityOptions.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleFacility(key)}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-lg border transition-colors",
                        facilities.includes(key)
                          ? "bg-accent text-accent-foreground border-accent"
                          : "bg-secondary text-muted-foreground border-border hover:border-accent/40"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-2">{t.fullAddress}</label>
                <textarea
                  placeholder="Jl. Contoh No. 12, Kecamatan, Kota, Provinsi"
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); setErrors({ ...errors, address: "" }) }}
                  rows={3}
                  className={cn(
                    "w-full text-sm bg-background border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition",
                    errors.address ? "border-destructive" : "border-input"
                  )}
                />
                {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
              </div>

              {/* WhatsApp */}
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-2">{t.ownerContact}</label>
                <Input
                  type="tel"
                  placeholder="e.g. 628123456789"
                  value={whatsapp}
                  onChange={(e) => { setWhatsapp(e.target.value); setErrors({ ...errors, whatsapp: "" }) }}
                  className={cn("text-sm", errors.whatsapp && "border-destructive")}
                />
                {errors.whatsapp && <p className="text-xs text-destructive mt-1">{errors.whatsapp}</p>}
              </div>

              {/* Ad Duration */}
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-2 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {t.adDuration}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {durationOptions.map((opt) => (
                    <button
                      key={opt.days}
                      type="button"
                      onClick={() => setDuration(opt.days)}
                      className={cn(
                        "py-3 px-2 rounded-xl border text-center transition-all",
                        duration === opt.days
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-secondary border-border text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      <p className="text-xs font-bold">{opt.label}</p>
                      <p className="text-xs mt-0.5">{opt.price}</p>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t.standardListing}
                </p>
              </div>

              {/* Submit */}
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total pembayaran</p>
                    <p className="text-lg font-bold text-primary">{selectedDuration.price}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>Durasi: {selectedDuration.label}</p>
                    <p>Jaringan: Solana</p>
                  </div>
                </div>
                {errors.submit ? (
                  <p className="text-sm text-destructive mb-3" role="alert">
                    {errors.submit}
                  </p>
                ) : null}
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-sm font-semibold gap-2">
                  <Wallet className="w-4 h-4" />
                  {t.payPublish}
                </Button>
              </div>
            </form>
          )}

          {step === "processing" && (
            <div className="bg-card rounded-2xl border border-border p-12 flex flex-col items-center gap-6 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">Memproses di Solana...</p>
                <p className="text-sm text-muted-foreground mt-1">Mengkonfirmasi pembayaran USDC via X402</p>
              </div>
              <div className="w-full max-w-xs bg-secondary rounded-full h-2 overflow-hidden">
                <div className="h-full bg-primary rounded-full w-full" style={{ animation: "progress 2.5s ease-in-out forwards" }} />
              </div>
              <div className="grid grid-cols-3 gap-4 w-full max-w-xs text-xs text-muted-foreground">
                {["Inisialisasi", "Konfirmasi", "Publikasi"].map((label, i) => (
                  <div key={label} className="flex flex-col items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-xs">{i + 1}</span>
                    </div>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="bg-card rounded-2xl border border-border p-10 flex flex-col items-center gap-5 text-center">
              <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Iklan Berhasil Dipublikasikan!</h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                  Properti Anda telah aktif dan bisa ditemukan oleh pencari kost di seluruh Indonesia.
                </p>
              </div>
              <div className="bg-secondary rounded-2xl p-5 w-full max-w-sm text-left space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tipe Properti</span>
                  <span className="font-semibold text-foreground">{propertyType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Durasi Iklan</span>
                  <span className="font-semibold text-foreground">{selectedDuration.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dibayar</span>
                  <span className="font-semibold text-accent">{selectedDuration.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-semibold text-accent flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-accent" /> Aktif
                  </span>
                </div>
              </div>
              <Button onClick={handleReset} variant="outline" className="mt-2">
                Pasang Iklan Lainnya
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
