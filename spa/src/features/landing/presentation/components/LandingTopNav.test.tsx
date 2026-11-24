import { describe, it, expect, vi } from "vitest"
import { renderToString } from "react-dom/server"
import { ThemeProvider } from "@/shared/theme"
import { I18nProvider } from "@/shared/i18n"
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
})
