"use client"

import { Search, PlusCircle, Home, Store, KeyRound, Palmtree } from "lucide-react"
import { type Translations } from "@/lib/i18n"

interface HeroSectionProps {
  t: Translations
  onViewChange: (view: "discover" | "post") => void
}

const propertyTypes = [
  { icon: Home, label: "Kost", count: "4,200+" },
  { icon: Store, label: "Ruko", count: "1,850+" },
  { icon: KeyRound, label: "Kontrakan", count: "3,100+" },
  { icon: Palmtree, label: "Villa", count: "920+" },
]

export function HeroSection({ t, onViewChange }: HeroSectionProps) {
  return (
    <section className="bg-primary relative overflow-hidden">
      {/* Subtle geometric accent */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        {/* Solana badge */}
        <div className="inline-flex items-center gap-2 bg-white/15 text-white rounded-full px-3 py-1 text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Powered by Solana · X402 Payments
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-balance mb-4 max-w-2xl">
          {t.heroTitle}
        </h1>
        <p className="text-white/80 text-base md:text-lg max-w-xl mb-10 leading-relaxed">
          {t.heroSubtitle}
        </p>

        {/* Dual-entry CTA */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => onViewChange("discover")}
            className="group flex items-center gap-3 bg-white text-primary font-semibold px-6 py-4 rounded-xl hover:bg-white/95 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <div className="text-base">{t.findProperty}</div>
              <div className="text-xs text-primary/60 font-normal">{t.findPropertyDesc}</div>
            </div>
          </button>

          <button
            onClick={() => onViewChange("post")}
            className="group flex items-center gap-3 bg-white/15 text-white font-semibold px-6 py-4 rounded-xl hover:bg-white/25 transition-all border border-white/20 hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <PlusCircle className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-base">{t.postListing}</div>
              <div className="text-xs text-white/60 font-normal">{t.postListingDesc}</div>
            </div>
          </button>
        </div>

        {/* Stats row */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {propertyTypes.map(({ icon: Icon, label, count }) => (
            <div key={label} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
              <Icon className="w-5 h-5 text-white/80 shrink-0" />
              <div>
                <div className="text-white font-bold text-sm">{count}</div>
                <div className="text-white/60 text-xs">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
