"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { DiscoveryPage } from "@/components/discovery-page"
import { LandlordPortal } from "@/components/landlord-portal"
import { Footer } from "@/components/footer"
import { type Language, getTranslation } from "@/lib/i18n"
import {
  detectBrowserLanguage,
  readStoredLanguage,
  writeStoredLanguage,
} from "@/lib/language-preference"

type View = "home" | "discover" | "post"

export default function RentChainApp() {
  const [lang, setLang] = useState<Language>("id")
  const [languageReady, setLanguageReady] = useState(false)
  const [view, setView] = useState<View>("home")

  const t = getTranslation(lang)

  useEffect(() => {
    setLang(readStoredLanguage() ?? detectBrowserLanguage())
    setLanguageReady(true)
  }, [])

  useEffect(() => {
    if (!languageReady) return
    writeStoredLanguage(lang)
    document.documentElement.lang = lang
  }, [lang, languageReady])

  const handleLangChange = (next: Language) => {
    setLang(next)
  }

  const handleViewChange = (newView: "home" | "discover" | "post") => {
    setView(newView)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        lang={lang}
        t={t}
        onLangChange={handleLangChange}
        activeView={view}
        onViewChange={handleViewChange}
      />

      <main className="flex-1">
        {view === "home" && (
          <>
            <HeroSection t={t} onViewChange={handleViewChange} />
            {/* Featured properties preview on home */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{t.featuredTitle}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{t.featuredSubtitle}</p>
                </div>
                <button
                  onClick={() => handleViewChange("discover")}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  {t.viewAll} &rarr;
                </button>
              </div>
              <DiscoveryPage t={t} />
            </div>
          </>
        )}

        {view === "discover" && (
          <>
            <div className="bg-card border-b border-border">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
                <h1 className="text-xl font-bold text-foreground">{t.findProperty}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t.findPropertyDesc}</p>
              </div>
            </div>
            <DiscoveryPage t={t} />
          </>
        )}

        {view === "post" && (
          <>
            <div className="bg-card border-b border-border">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
                <h1 className="text-xl font-bold text-foreground">{t.postListing}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t.postListingDesc}</p>
              </div>
            </div>
            <LandlordPortal t={t} />
          </>
        )}
      </main>

      <Footer t={t} />
    </div>
  )
}
