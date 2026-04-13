"use client"

import { useState } from "react"
import { Search, Wallet, Globe, ChevronDown, Menu, X, Building2 } from "lucide-react"
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

export function Header({ lang, t, onLangChange, activeView, onViewChange }: HeaderProps) {
  const [walletConnected, setWalletConnected] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const currentLang = languages.find((l) => l.code === lang)

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <button
            onClick={() => onViewChange("home")}
            className="flex items-center gap-2 shrink-0 group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
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
              className="pl-9 bg-secondary border-border text-sm"
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
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
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
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {t.postListing}
            </button>
          </nav>

          {/* Language + Wallet */}
          <div className="flex items-center gap-2 ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1 text-sm px-2">
                  <Globe className="w-4 h-4" />
                  <span className="hidden lg:inline">{currentLang?.flag} {currentLang?.label}</span>
                  <span className="lg:hidden">{currentLang?.flag}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {languages.map((l) => (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => onLangChange(l.code)}
                    className={cn("cursor-pointer", lang === l.code && "font-semibold text-primary")}
                  >
                    <span className="mr-2">{l.flag}</span>
                    {l.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              size="sm"
              onClick={() => setWalletConnected(!walletConnected)}
              className={cn(
                "gap-1.5 text-sm font-medium",
                walletConnected
                  ? "bg-accent text-accent-foreground hover:bg-accent/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">
                {walletConnected ? "Bx3f...9kR2" : t.connectWallet}
              </span>
            </Button>

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
                <Button variant="outline" size="sm" className="gap-1 text-sm w-full justify-between">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4" />
                    {currentLang?.flag} {currentLang?.label}
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                {languages.map((l) => (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => onLangChange(l.code)}
                    className={cn("cursor-pointer", lang === l.code && "font-semibold text-primary")}
                  >
                    <span className="mr-2">{l.flag}</span>
                    {l.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </header>
  )
}
