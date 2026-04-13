"use client"

import Image from "next/image"
import { MapPin, Lock, Unlock, Bed, Bath, Ruler, Wifi, Car, Wind, UtensilsCrossed, WashingMachine, Shield, Waves, Dumbbell, MessageCircle, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type Property } from "@/lib/properties"
import { type Translations } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const facilityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="w-3 h-3" />,
  parking: <Car className="w-3 h-3" />,
  ac: <Wind className="w-3 h-3" />,
  kitchen: <UtensilsCrossed className="w-3 h-3" />,
  laundry: <WashingMachine className="w-3 h-3" />,
  security: <Shield className="w-3 h-3" />,
  pool: <Waves className="w-3 h-3" />,
  gym: <Dumbbell className="w-3 h-3" />,
}

const facilityLabels: Record<string, string> = {
  wifi: "WiFi",
  parking: "Parking",
  ac: "AC",
  kitchen: "Kitchen",
  laundry: "Laundry",
  security: "Security",
  pool: "Pool",
  gym: "Gym",
}

const typeBadgeColors: Record<string, string> = {
  Kost: "bg-blue-100 text-blue-700",
  Ruko: "bg-orange-100 text-orange-700",
  Kontrakan: "bg-green-100 text-green-700",
  Villa: "bg-purple-100 text-purple-700",
}

interface PropertyCardProps {
  property: Property
  t: Translations
  unlocked: boolean
  onUnlock: (property: Property) => void
}

export function PropertyCard({ property, t, unlocked, onUnlock }: PropertyCardProps) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={property.image}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", typeBadgeColors[property.type])}>
            {property.type}
          </span>
          {property.featured && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              {t.featured}
            </span>
          )}
        </div>
        {/* Lock overlay when not unlocked */}
        {!unlocked && (
          <div className="absolute inset-0 bg-foreground/5" />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2 mb-2">{property.title}</h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-muted-foreground mb-3">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="text-xs truncate">{property.location}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Ruler className="w-3.5 h-3.5" />
            <span>{property.size} m²</span>
          </div>
          <div className="flex items-center gap-1">
            <Bed className="w-3.5 h-3.5" />
            <span>{property.beds} {t.beds}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5" />
            <span>{property.baths} {t.baths}</span>
          </div>
        </div>

        {/* Facilities */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {property.facilities.slice(0, 4).map((f) => (
            <span key={f} className="inline-flex items-center gap-1 bg-secondary text-muted-foreground px-2 py-0.5 rounded-md text-xs">
              {facilityIcons[f]}
              {facilityLabels[f]}
            </span>
          ))}
          {property.facilities.length > 4 && (
            <span className="inline-flex items-center bg-secondary text-muted-foreground px-2 py-0.5 rounded-md text-xs">
              +{property.facilities.length - 4}
            </span>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            {unlocked ? (
              <div>
                <p className="text-xs text-muted-foreground">{property.fullAddress.split(",")[0]}</p>
                <p className="text-sm font-bold text-primary">
                  Rp {property.price.toLocaleString("id-ID")}<span className="text-xs font-normal text-muted-foreground">{t.perMonth}</span>
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Lock className="w-3 h-3" />
                  <span className="text-xs">{t.lockedAddress}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                  <span className="text-sm font-medium blur-sm select-none">{property.blurredPrice}</span>
                  <span className="text-xs text-muted-foreground not-italic">{t.perMonth}</span>
                </div>
              </div>
            )}
          </div>

          {unlocked ? (
            <a
              href={`https://wa.me/${property.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </Button>
            </a>
          ) : (
            <Button
              size="sm"
              onClick={() => onUnlock(property)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5 whitespace-nowrap"
            >
              <Unlock className="w-3.5 h-3.5" />
              {t.unlockDetails} ({t.unlockCost})
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
