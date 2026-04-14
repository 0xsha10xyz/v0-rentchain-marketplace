export function apiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  if (!base) return ""
  return base.replace(/\/$/, "")
}

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`
  const base = apiBaseUrl()
  return base ? `${base}${p}` : p
}

