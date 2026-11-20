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

export function getAppLocale(): AppLocale {
  const current = getParaglideLocale()
  return isValidLocale(current) ? current : DEFAULT_LOCALE
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
}
