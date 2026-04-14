export function normalizeHttpRpcUrl(raw: string | undefined): string | undefined {
  const t = raw?.trim()
  if (!t) return undefined
  const withScheme = /^https?:\/\//i.test(t) ? t : `https://${t}`
  try {
    const u = new URL(withScheme)
    if (u.protocol === "http:" || u.protocol === "https:") return withScheme
  } catch {
    /* ignore */
  }
  return undefined
}

