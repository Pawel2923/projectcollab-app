import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isValidLocale,
  getLocaleLabel,
  setAppLocale,
  getAppLocale,
  onLocaleChange,
  detectBrowserLocale,
  getStoredLocale,
  type AppLocale,
} from "./i18n"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

describe("i18n module", () => {
  beforeEach(async () => {
    await setAppLocale("pl")
  })

  describe("locale constants and validation", () => {
    it("has 'pl' as default locale", () => {
      expect(DEFAULT_LOCALE).toBe("pl")
    })

    it("supports 'pl' and 'en'", () => {
      expect(SUPPORTED_LOCALES).toEqual(["pl", "en"])
    })

    it("validates supported locales", () => {
      expect(isValidLocale("pl")).toBe(true)
      expect(isValidLocale("en")).toBe(true)
      expect(isValidLocale("de")).toBe(false)
      expect(isValidLocale("")).toBe(false)
      expect(isValidLocale(null)).toBe(false)
      expect(isValidLocale(undefined)).toBe(false)
      expect(isValidLocale(123)).toBe(false)
    })

    it("returns appropriate labels for locales", () => {
      expect(getLocaleLabel("pl")).toBe("Polski")
      expect(getLocaleLabel("en")).toBe("English")
    })
  })

  describe("automatic browser locale detection", () => {
    it("returns null for getStoredLocale when no document/storage is present", () => {
      expect(getStoredLocale()).toBeNull()
    })

    it("detects English from en-US or en-GB", () => {
      expect(detectBrowserLocale(["en-US", "en"])).toBe("en")
      expect(detectBrowserLocale(["en-GB"])).toBe("en")
      expect(detectBrowserLocale(["EN"])).toBe("en")
    })

    it("detects Polish from pl-PL or pl", () => {
      expect(detectBrowserLocale(["pl-PL", "pl"])).toBe("pl")
      expect(detectBrowserLocale(["pl"])).toBe("pl")
      expect(detectBrowserLocale(["PL"])).toBe("pl")
    })

    it("picks first supported language from user preference order", () => {
      expect(detectBrowserLocale(["de-DE", "de", "en-US"])).toBe("en")
      expect(detectBrowserLocale(["fr-FR", "pl-PL", "en-US"])).toBe("pl")
    })

    it("falls back to default locale (pl) when user languages are unsupported", () => {
      expect(detectBrowserLocale(["es-ES", "fr-FR", "it-IT"])).toBe("pl")
      expect(detectBrowserLocale([])).toBe("pl")
      expect(detectBrowserLocale(undefined as unknown as string[])).toBe("pl")
    })
  })

  describe("setAppLocale and message translation", () => {
    it("starts with Polish landing hero title by default", () => {
      expect(getAppLocale()).toBe("pl")
      expect(getLocale()).toBe("pl")
      expect(m.landing_hero_title()).toBe("Planuj, twórz i współpracuj")
      expect(m.landing_hero_cta_logged_out()).toBe("Rozpocznij")
    })

    it("switches to English when setAppLocale('en') is called", async () => {
      await setAppLocale("en")

      expect(getAppLocale()).toBe("en")
      expect(getLocale()).toBe("en")
      expect(m.landing_hero_title()).toBe("Plan, build, and collaborate")
      expect(m.landing_hero_cta_logged_out()).toBe("Get started")
    })

    it("switches back to Polish when setAppLocale('pl') is called", async () => {
      await setAppLocale("en")
      expect(m.landing_hero_title()).toBe("Plan, build, and collaborate")

      await setAppLocale("pl")
      expect(getAppLocale()).toBe("pl")
      expect(m.landing_hero_title()).toBe("Planuj, twórz i współpracuj")
    })

    it("ignores unsupported locale values and keeps current locale", async () => {
      const current = getAppLocale()
      await setAppLocale("fr" as unknown as AppLocale)
      expect(getAppLocale()).toBe(current)
    })

    it("notifies registered listeners when locale changes", async () => {
      const listener = vi.fn()
      const unsubscribe = onLocaleChange(listener)

      await setAppLocale("en")
      expect(listener).toHaveBeenCalledWith("en")

      await setAppLocale("pl")
      expect(listener).toHaveBeenCalledWith("pl")

      unsubscribe()

      await setAppLocale("en")
      expect(listener).toHaveBeenCalledTimes(2)
    })

    it("does not notify listeners when an invalid locale is passed", async () => {
      const listener = vi.fn()
      const unsubscribe = onLocaleChange(listener)

      await setAppLocale("invalid" as unknown as AppLocale)
      expect(listener).not.toHaveBeenCalled()

      unsubscribe()
    })
  })

  describe("remaining views translation", () => {
    it("translates signin, signup, and organizations titles", async () => {
      expect(m.auth_sign_in_title()).toBe("Logowanie")
      expect(m.auth_sign_up_title()).toBe("Rejestracja")
      expect(m.organizations_title()).toBe("Organizacje")

      await setAppLocale("en")
      expect(m.auth_sign_in_title()).toBe("Sign in")
      expect(m.auth_sign_up_title()).toBe("Sign up")
      expect(m.organizations_title()).toBe("Organizations")
    })

    it("translates policy views titles and common back label", async () => {
      expect(m.common_back()).toBe("Powróć")
      expect(m.common_theme_auto()).toBe("Automatyczny")
      expect(m.common_theme_auto_short()).toBe("Auto")
      expect(m.policy_hub_title()).toBe("Zasady i polityki")
      expect(m.policy_privacy_title()).toBe("Polityka prywatności")
      expect(m.policy_terms_title()).toBe("Warunki korzystania z ProjectCollab")

      await setAppLocale("en")
      expect(m.common_back()).toBe("Back")
      expect(m.common_theme_auto()).toBe("Automatic")
      expect(m.common_theme_auto_short()).toBe("Auto")
      expect(m.policy_hub_title()).toBe("Terms & Policies")
      expect(m.policy_privacy_title()).toBe("Privacy Policy")
      expect(m.policy_terms_title()).toBe("Terms of Service for ProjectCollab")
    })
  })
})
