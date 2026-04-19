import { z } from "zod"

const propertyTypeEnum = z.enum(["Kost", "Ruko", "Kontrakan", "Villa"])

const listingDurationEnum = z.union([z.literal(7), z.literal(14), z.literal(30)])

export const propertyListQuerySchema = z.object({
  type: propertyTypeEnum.optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
  location: z.string().optional(),
  minSize: z.coerce.number().finite().optional(),
  maxSize: z.coerce.number().finite().optional(),
  minPrice: z.coerce.number().finite().optional(),
  maxPrice: z.coerce.number().finite().optional(),
  facilities: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined
      if (Array.isArray(v)) return v
      return v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    }),
  sort: z.enum(["newest", "priceLow", "priceHigh"]).optional().default("newest"),
})

export type PropertyListQuery = z.infer<typeof propertyListQuerySchema>

export const createPropertyBodySchema = z.object({
  type: propertyTypeEnum,
  size: z.coerce.number().finite().positive(),
  price: z.coerce.number().finite().positive(),
  facilities: z.array(z.string()).default([]),
  fullAddress: z.string().trim().min(3).max(2000),
  whatsapp: z.string().trim().min(8).max(32),
  beds: z.coerce.number().int().min(0).max(50).optional().default(1),
  baths: z.coerce.number().int().min(0).max(50).optional().default(1),
  title: z.string().min(3).max(200).optional(),
  location: z.string().min(2).max(200).optional(),
  image: z.string().min(1).max(500).optional(),
  adDurationDays: listingDurationEnum.default(7),
})

export type CreatePropertyBody = z.infer<typeof createPropertyBodySchema>

export const unlockBodySchema = z.object({
  propertyId: z.string().min(1).max(64),
  sessionId: z.string().uuid(),
})

export type UnlockBody = z.infer<typeof unlockBodySchema>

export const unlockListQuerySchema = z.object({
  sessionId: z.string().uuid(),
  propertyId: z.string().min(1).max(64).optional(),
})

export type UnlockListQuery = z.infer<typeof unlockListQuerySchema>

