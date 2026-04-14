"use client"

import { useState } from "react"
import { Search, Globe, ChevronDown, Menu, X, Building2 } from "lucide-react"
import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { languages, type Language, type Translations } from "@/lib/i18n"
import { cn } from "@/lib/utils"

interface HeaderProps {
  lang: Language
  t: Translations
  onLangChange: (lang: Language) => void
  activeView: "home" | "discover" | "post"
  onViewChange: (view: "home" | "discover" | "post") => void
}

const walletButtonLabels = {
  "change-wallet": "Change wallet",
  connecting: "Connecting ...",
  "copy-address": "Copy address",
  copied: "Copied",
  disconnect: "Disconnect",
  "has-wallet": "Connect",
  "no-wallet": "connect wallet",
} as const

export function Header({ lang, t, onLangChange, activeView, onViewChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const currentLang = languages.find((l) => l.code === lang)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <button
            onClick={() => onViewChange("home")}
            className="flex items-center gap-2 shrink-0 group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/95 flex items-center justify-center shadow-sm ring-1 ring-primary/20">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground tracking-tight">
              Rent<span className="text-primary">Chain</span>
            </span>
          </button>

          {/* Search bar – hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t.searchPlaceholder}
              className="pl-9 bg-card/60 border-border/70 text-sm shadow-sm focus-visible:ring-primary/20"
            />
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1 ml-auto">
            <button
              onClick={() => onViewChange("discover")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                activeView === "discover"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
              )}
            >
              {t.findProperty}
            </button>
            <button
              onClick={() => onViewChange("post")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                activeView === "post"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
              )}
            >
              {t.postListing}
            </button>
          </nav>

          {/* Language + Wallet */}
          <div className="flex items-center gap-2 ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1.5 text-sm px-2.5">
                  <Globe className="w-4 h-4 shrink-0" />
                  <span className="hidden lg:inline tabular-nums">
                    <span className="text-muted-foreground text-xs mr-1.5">{currentLang?.region}</span>
                    <span className="font-medium">{currentLang?.label}</span>
                  </span>
                  <span className="lg:hidden text-xs text-muted-foreground">{currentLang?.region}</span>
                  <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[13.5rem] rounded-xl border-border/70 bg-popover/95 p-1 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-popover/80">
                {languages.map((l) => (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => onLangChange(l.code)}
                    className={cn(
                      "cursor-pointer rounded-lg px-3 py-2.5 focus:bg-secondary",
                      lang === l.code && "font-bold text-primary bg-primary/5"
                    )}
                  >
                    <span className="flex w-full items-center justify-between gap-6">
                      <span className="text-xs text-muted-foreground tabular-nums w-7 shrink-0">{l.region}</span>
                      <span className={cn("flex-1 text-left text-sm", lang === l.code && "font-bold text-primary")}>
                        {l.label}
                      </span>
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden sm:block shrink-0 [&_.wallet-adapter-button-trigger]:h-9">
              <BaseWalletMultiButton
                labels={walletButtonLabels}
                className="!rounded-md !bg-primary !text-primary-foreground !text-sm !font-medium !h-9 hover:!bg-primary/90 !shadow-sm !ring-1 !ring-primary/20"
              />
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 pb-4 pt-2 space-y-2">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t.searchPlaceholder} className="pl-9 bg-secondary text-sm" />
          </div>
          <button
            onClick={() => { onViewChange("discover"); setMobileMenuOpen(false) }}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md text-sm font-medium",
              activeView === "discover" ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}
          >
            {t.findProperty}
          </button>
          <button
            onClick={() => { onViewChange("post"); setMobileMenuOpen(false) }}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md text-sm font-medium",
              activeView === "post" ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}
          >
            {t.postListing}
          </button>
          <div className="pt-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-sm w-full justify-between">
                  <span className="flex items-center gap-2 min-w-0">
                    <Globe className="w-4 h-4 shrink-0" />
                    <span className="tabular-nums truncate">
                      <span className="text-muted-foreground text-xs mr-1">{currentLang?.region}</span>
                      <span className="font-medium">{currentLang?.label}</span>
                    </span>
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[13.5rem] rounded-xl border-border bg-card p-1 shadow-lg">
                {languages.map((l) => (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => onLangChange(l.code)}
                    className={cn(
                      "cursor-pointer rounded-lg px-3 py-2.5 focus:bg-secondary",
                      lang === l.code && "font-bold text-primary bg-primary/5"
                    )}
                  >
                    <span className="flex w-full items-center justify-between gap-6">
                      <span className="text-xs text-muted-foreground tabular-nums w-7 shrink-0">{l.region}</span>
                      <span className={cn("flex-1 text-left text-sm", lang === l.code && "font-bold text-primary")}>
                        {l.label}
                      </span>
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="sm:hidden pt-2 border-t border-border mt-2">
            <BaseWalletMultiButton
              labels={walletButtonLabels}
              className="!w-full !justify-center !rounded-md !bg-primary !text-primary-foreground !text-sm !font-medium !h-10 hover:!bg-primary/90"
            />
          </div>
        </div>
      )}
    </header>
  )
}
