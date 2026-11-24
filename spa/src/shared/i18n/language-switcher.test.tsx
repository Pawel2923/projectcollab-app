import { describe, it, expect } from "vitest"
import { renderToString } from "react-dom/server"
import { I18nProvider } from "./i18n-provider"
import { LanguageSwitcher } from "./language-switcher"
import { m } from "@/paraglide/messages"

describe("LanguageSwitcher", () => {
  it("renders trigger button with language switcher aria-label", () => {
    const html = renderToString(
      <I18nProvider>
        <LanguageSwitcher />
      </I18nProvider>
    )

    expect(html).toContain(`aria-label="${m.language_switcher_label()}"`)
  })

  it("renders tooltip trigger when tooltip is enabled", () => {
    const html = renderToString(
      <I18nProvider>
        <LanguageSwitcher tooltip />
      </I18nProvider>
    )

    expect(html).toContain('data-slot="tooltip-trigger"')
    expect(html).toContain(`aria-label="${m.language_switcher_label()}"`)
  })

  it("renders custom tooltip text when string is provided", () => {
    const html = renderToString(
      <I18nProvider>
        <LanguageSwitcher tooltip="Custom Language Tooltip" />
      </I18nProvider>
    )

    expect(html).toContain('data-slot="tooltip-trigger"')
  })
})
