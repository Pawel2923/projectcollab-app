import {
  getLocale as getParaglideLocale,
  setLocale as setParaglideLocale,
  locales as paraglideLocales,
  baseLocale as paraglideBaseLocale,
} from "@/paraglide/runtime"

export const SUPPORTED_LOCALES = paraglideLocales
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: AppLocale = paraglideBaseLocale

export function isValidLocale(value: unknown): value is AppLocale {
  return (
    typeof value === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  )
}

export function getLocaleLabel(locale: AppLocale): string {
  switch (locale) {
    case "pl":
      return "Polski"
    case "en":
      return "English"
    default:
      return locale
  }
}

/**
 * Detects the user's preferred locale from browser languages.
 * Matches full language tag (e.g. "pl-pl" -> "pl") or base language tag (e.g. "en-us" -> "en").
 * Returns the first supported locale in the user's preference order,
 * or falls back to DEFAULT_LOCALE ("pl").
 */
export function detectBrowserLocale(languages?: readonly string[]): AppLocale {
  const candidateLanguages =
    languages ??
    (typeof window !== "undefined" && typeof navigator !== "undefined"
      ? (navigator.languages ??
        (navigator.language ? [navigator.language] : []))
      : [])

  if (!candidateLanguages || candidateLanguages.length === 0) {
    return DEFAULT_LOCALE
  }

  for (const rawLang of candidateLanguages) {
    if (!rawLang || typeof rawLang !== "string") {
      continue
    }

    const lang = rawLang.trim().toLowerCase()
    if (isValidLocale(lang)) {
      return lang
    }

    const base = lang.split("-")[0]
    if (isValidLocale(base)) {
      return base
    }
  }

  return DEFAULT_LOCALE
}

/**
 * Retrieves previously stored locale choice from cookie or localStorage.
 * Returns null if the user has not stored a preference yet (first visit).
 */
export function getStoredLocale(): AppLocale | null {
  if (typeof document !== "undefined") {
    try {
      const match = document.cookie.match(/(?:^|;\s*)PARAGLIDE_LOCALE=([^;]+)/)
      if (match && isValidLocale(match[1])) {
        return match[1]
      }
    } catch {
      // document.cookie can throw in opaque origins
    }

    try {
      const stored = localStorage.getItem("PARAGLIDE_LOCALE")
      if (stored && isValidLocale(stored)) {
        return stored
      }
    } catch {
      // localStorage can throw if storage access is restricted
    }
  }
  return null
}

export function getAppLocale(): AppLocale {
  const current = getParaglideLocale()
  return isValidLocale(current) ? current : DEFAULT_LOCALE
}

export type LocaleChangeListener = (locale: AppLocale) => void
const localeChangeListeners = new Set<LocaleChangeListener>()

export function onLocaleChange(listener: LocaleChangeListener): () => void {
  localeChangeListeners.add(listener)
  return () => {
    localeChangeListeners.delete(listener)
  }
}

export async function setAppLocale(
  locale: AppLocale,
  options: { reload?: boolean } = { reload: false }
): Promise<void> {
  if (!isValidLocale(locale)) {
    return
  }

  await setParaglideLocale(locale, options)

  if (typeof document !== "undefined") {
    document.documentElement.lang = locale
  }

  for (const listener of localeChangeListeners) {
    listener(locale)
  }
}
