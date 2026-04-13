import { mkdir, readFile, writeFile } from "node:fs/promises"

import { mockProperties, type Property } from "@/lib/properties"
import { runWithLock } from "@/lib/server/mutex"
import type { CreatePropertyBody } from "@/lib/server/schemas"

export interface UnlockRecord {
  id: string
  propertyId: string
  createdAt: string
  /** When set, unlock can be listed via GET /api/unlocks?sessionId=… */
  sessionId?: string
}

export interface MarketplaceState {
  properties: Property[]
  unlocks: UnlockRecord[]
}

function dirnameOfFile(filePath: string): string {
  const forward = filePath.lastIndexOf("/")
  const backward = filePath.lastIndexOf("\\")
  const idx = Math.max(forward, backward)
  return idx === -1 ? process.cwd() : filePath.slice(0, idx)
}

function statePath(): string {
  const override = process.env.MARKETPLACE_STATE_PATH?.trim()
  if (override) {
    return override
  }
  const cwd = process.cwd().replace(/\\/g, "/")
  return `${cwd}/data/marketplace-state.json`
}

let volatileState: MarketplaceState | null = null
let persistenceEnabled = true

function seedState(): MarketplaceState {
  return {
    properties: mockProperties.map((p) => ({ ...p })),
    unlocks: [],
  }
}

function defaultImageForType(type: Property["type"]): string {
  const map: Record<Property["type"], string> = {
    Kost: "/images/kost-1.jpg",
    Ruko: "/images/ruko-1.jpg",
    Kontrakan: "/images/kontrakan-1.jpg",
    Villa: "/images/villa-1.jpg",
  }
  return map[type]
}

function deriveLocation(fullAddress: string): string {
  const parts = fullAddress
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  if (parts.length >= 2) {
    return parts.slice(-2).join(", ")
  }
  return parts[0] ?? "Indonesia"
}

function obscuredMonthlyPrice(): string {
  return "Rp •.•••.000"
}

function deriveTitle(type: Property["type"], fullAddress: string): string {
  const line = fullAddress.split(/\r?\n/)[0]?.trim() ?? fullAddress
  const short = line.length > 70 ? `${line.slice(0, 67)}…` : line
  return `${type} — ${short}`
}

async function readDisk(): Promise<MarketplaceState | null> {
  if (!persistenceEnabled) return null
  try {
    const raw = await readFile(statePath(), "utf8")
    const parsed = JSON.parse(raw) as MarketplaceState
    if (!Array.isArray(parsed.properties) || !Array.isArray(parsed.unlocks)) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

async function writeDisk(state: MarketplaceState): Promise<void> {
  if (!persistenceEnabled) {
    volatileState = state
    return
  }
  const filePath = statePath()
  await mkdir(dirnameOfFile(filePath), { recursive: true })
  await writeFile(filePath, JSON.stringify(state, null, 2), "utf8")
}

async function loadInternal(): Promise<MarketplaceState> {
  if (!persistenceEnabled && volatileState) {
    return volatileState
  }

  const fromDisk = await readDisk()
  if (fromDisk) {
    if (!persistenceEnabled) {
      volatileState = fromDisk
    }
    return fromDisk
  }

  const seeded = seedState()
  try {
    await writeDisk(seeded)
  } catch {
    persistenceEnabled = false
    volatileState = seeded
  }
  return seeded
}

export async function getMarketplaceState(): Promise<MarketplaceState> {
  return runWithLock(async () => {
    const s = await loadInternal()
    return {
      properties: s.properties.map((p) => ({ ...p })),
      unlocks: s.unlocks.map((u) => ({ ...u })),
    }
  })
}

export async function mutateMarketplaceState(
  mutator: (draft: MarketplaceState) => void
): Promise<MarketplaceState> {
  return runWithLock(async () => {
    const current = await loadInternal()
    const next: MarketplaceState = {
      properties: current.properties.map((p) => ({ ...p })),
      unlocks: current.unlocks.map((u) => ({ ...u })),
    }
    mutator(next)
    await writeDisk(next)
    if (!persistenceEnabled) {
      volatileState = next
    }
    return next
  })
}

export async function addProperty(property: Property): Promise<Property> {
  await mutateMarketplaceState((draft) => {
    draft.properties.push(property)
  })
  return property
}

export function buildPropertyFromPayload(body: CreatePropertyBody): Property {
  const id = crypto.randomUUID()
  const postedAt = new Date().toISOString().slice(0, 10)
  const location = body.location?.trim() || deriveLocation(body.fullAddress)
  const title = body.title?.trim() || deriveTitle(body.type, body.fullAddress)
  const image = body.image?.trim() || defaultImageForType(body.type)

  return {
    id,
    type: body.type,
    title,
    location,
    fullAddress: body.fullAddress.trim(),
    blurredPrice: obscuredMonthlyPrice(),
    price: body.price,
    size: body.size,
    beds: body.beds,
    baths: body.baths,
    facilities: body.facilities,
    image,
    whatsapp: body.whatsapp.trim(),
    postedAt,
  }
}

export async function appendUnlock(
  propertyId: string,
  sessionId: string
): Promise<UnlockRecord> {
  const snapshot = await getMarketplaceState()
  if (!snapshot.properties.some((p) => p.id === propertyId)) {
    throw new Error("PROPERTY_NOT_FOUND")
  }

  let created: UnlockRecord | undefined
  await mutateMarketplaceState((draft) => {
    if (!draft.properties.some((p) => p.id === propertyId)) {
      return
    }
    created = {
      id: crypto.randomUUID(),
      propertyId,
      createdAt: new Date().toISOString(),
      sessionId,
    }
    draft.unlocks.push(created)
  })

  if (!created) {
    throw new Error("PROPERTY_NOT_FOUND")
  }
  return created
}

/** Distinct property ids unlocked in this browser session (first unlock wins order). */
export async function listUnlockedPropertyIdsForSession(sessionId: string): Promise<string[]> {
  const state = await getMarketplaceState()
  const ordered: string[] = []
  const seen = new Set<string>()
  for (const u of state.unlocks) {
    if (u.sessionId !== sessionId) continue
    if (seen.has(u.propertyId)) continue
    seen.add(u.propertyId)
    ordered.push(u.propertyId)
  }
  return ordered
}

export async function hasUnlockForSession(
  propertyId: string,
  sessionId: string
): Promise<boolean> {
  const state = await getMarketplaceState()
  return state.unlocks.some((u) => u.propertyId === propertyId && u.sessionId === sessionId)
}
