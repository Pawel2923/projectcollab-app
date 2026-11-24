import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderToString } from "react-dom/server"
import { ThemeProvider } from "@/shared/theme"
import { I18nProvider, setAppLocale } from "@/shared/i18n"
import { LandingTopNav } from "./LandingTopNav"
import { m } from "@/paraglide/messages"

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode
    to: string
    [key: string]: unknown
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

describe("LandingTopNav", () => {
  beforeEach(async () => {
    await setAppLocale("pl")
  })

  it("renders landing navigation with tooltips for theme and language selector triggers", () => {
    const html = renderToString(
      <ThemeProvider>
        <I18nProvider>
          <LandingTopNav user={null} />
        </I18nProvider>
      </ThemeProvider>
    )

    // Check that brand link is rendered
    expect(html).toContain(
      `aria-label="${m.landing_nav_logotype_aria_label()}"`
    )

    // Check that theme selector and language selector buttons have tooltip triggers
    expect(html).toContain(`aria-label="${m.common_theme_choose()}"`)
    expect(html).toContain(`aria-label="${m.language_switcher_label()}"`)

    // Verify both triggers have data-slot="tooltip-trigger"
    const tooltipTriggers = html.match(/data-slot="tooltip-trigger"/g) || []
    expect(tooltipTriggers.length).toBeGreaterThanOrEqual(2)
  })

  it("renders localized welcome greeting for authenticated users in Polish and English", async () => {
    const user = {
      id: 1,
      email: "alice@example.com",
      username: "alice",
      roles: ["ROLE_USER"],
      isVerified: true,
    }

    const polishHtml = renderToString(
      <ThemeProvider>
        <I18nProvider>
          <LandingTopNav user={user} />
        </I18nProvider>
      </ThemeProvider>
    )
    expect(polishHtml).toContain("Cześć alice!")

    await setAppLocale("en")

    const englishHtml = renderToString(
      <ThemeProvider>
        <I18nProvider>
          <LandingTopNav user={user} />
        </I18nProvider>
      </ThemeProvider>
    )
    expect(englishHtml).toContain("Hi alice!")
    expect(englishHtml).not.toContain("Cześć alice!")
  })
})
