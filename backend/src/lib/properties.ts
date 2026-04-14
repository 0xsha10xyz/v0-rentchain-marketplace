export type PropertyType = "Kost" | "Ruko" | "Kontrakan" | "Villa"

export interface Property {
  id: string
  type: PropertyType
  title: string
  location: string
  fullAddress: string
  blurredPrice: string
  price: number
  size: number
  beds: number
  baths: number
  facilities: string[]
  image: string
  whatsapp: string
  postedAt: string
  featured?: boolean
}

