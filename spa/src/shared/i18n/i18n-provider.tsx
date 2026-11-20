import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react"
import {
  type AppLocale,
  SUPPORTED_LOCALES,
  getAppLocale,
  setAppLocale,
  isValidLocale,
  onLocaleChange,
} from "./i18n"

export interface I18nContextValue {
  locale: AppLocale
  setLocale: (newLocale: AppLocale) => Promise<void>
  locales: readonly AppLocale[]
}

const I18nContext = createContext<I18nContextValue | null>(null)

export interface I18nProviderProps {
  children: React.ReactNode
  initialLocale?: AppLocale
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<AppLocale>(() => {
    return initialLocale ?? getAppLocale()
  })

  useEffect(() => {
    return onLocaleChange((newLocale) => {
      setLocaleState(newLocale)
    })
  }, [])

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale
    }
  }, [locale])

  const changeLocale = useCallback(
    async (newLocale: AppLocale) => {
      if (!isValidLocale(newLocale) || newLocale === locale) {
        return
      }

      await setAppLocale(newLocale, { reload: false })
      setLocaleState(newLocale)
    },
    [locale]
  )

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale: changeLocale,
        locales: SUPPORTED_LOCALES,
      }}
    >
      <React.Fragment key={locale}>{children}</React.Fragment>
    </I18nContext.Provider>
  )
}

export function useLocale(): I18nContextValue {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useLocale must be used within an I18nProvider")
  }
  return context
}
