const STORAGE_KEY = "rentchain_marketplace_session_id"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * Stable per-browser id (localStorage) so unlocks can be restored after reload without wallet auth.
 */
export function getOrCreateBrowserSessionId(): string {
  if (typeof window === "undefined") {
    return ""
  }
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY)
    if (existing && UUID_RE.test(existing)) {
      return existing
    }
    const created = crypto.randomUUID()
    window.localStorage.setItem(STORAGE_KEY, created)
    return created
  } catch {
    return crypto.randomUUID()
  }
}
