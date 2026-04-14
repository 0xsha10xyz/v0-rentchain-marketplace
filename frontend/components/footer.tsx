import { Building2, ExternalLink, AlertCircle } from "lucide-react"
import { type Translations } from "@/lib/i18n"

interface FooterProps {
  t: Translations
}

export function Footer({ t }: FooterProps) {
  return (
    <footer className="bg-card border-t border-border mt-12">
      {/* Disclaimer banner */}
      <div className="bg-amber-50 border-b border-amber-200/70 dark:bg-amber-950/30 dark:border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900/90 dark:text-amber-100/80 leading-relaxed">
            <strong>Disclaimer:</strong> {t.disclaimer}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <Building2 className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-base text-foreground">
                Rent<span className="text-primary">Chain</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Platform listing properti Indonesia berbasis Solana dengan sistem pembayaran X402.
              Kost, Ruko, Kontrakan, dan Villa.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Platform</p>
            <div className="space-y-2">
              {["Cari Properti", "Pasang Iklan", "Cara Kerja", "FAQ"].map((item) => (
                <a key={item} href="#" className="block text-xs text-muted-foreground hover:text-primary transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Legal & Solana */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">Legal & Blockchain</p>
            <div className="space-y-2">
              <a
                href="#"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {t.termsOfService}
              </a>
              <a
                href="#"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Kebijakan Privasi
              </a>
              <a
                href="https://explorer.solana.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {t.solanaExplorer}
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://solana.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Solana Network
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} RentChain. {t.allRightsReserved}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span>Solana Mainnet</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>X402 Protocol</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
