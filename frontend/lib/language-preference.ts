import type { Language } from "@/lib/i18n"

const STORAGE_KEY = "rentchain_language_preference"

const VALID_LANGUAGES: readonly Language[] = ["id", "en", "zh", "ja", "ru", "pt"]

export function isLanguage(value: string): value is Language {
  return (VALID_LANGUAGES as readonly string[]).includes(value)
}

export function readStoredLanguage(): Language | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw && isLanguage(raw)) {
      return raw
    }
  } catch {
    /* private mode / blocked storage */
  }
  return null
}

export function writeStoredLanguage(lang: Language): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    /* ignore */
  }
}

/** Map browser locale to the closest supported app language. */
export function detectBrowserLanguage(): Language {
  if (typeof navigator === "undefined") return "en"
  const list =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language]
  for (const entry of list) {
    const base = entry.toLowerCase().split("-")[0]
    if (base === "id") return "id"
    if (base === "zh") return "zh"
    if (base === "ja") return "ja"
    if (base === "ru") return "ru"
    if (base === "pt") return "pt"
    if (base === "en") return "en"
  }
  return "en"
}
