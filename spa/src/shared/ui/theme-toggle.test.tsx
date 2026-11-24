import { describe, it, expect } from "vitest"
import { renderToString } from "react-dom/server"
import { ThemeProvider } from "@/shared/theme"
import { ThemeToggle } from "./theme-toggle"
import { m } from "@/paraglide/messages"

describe("ThemeToggle", () => {
  it("renders trigger button with theme choose aria-label", () => {
    const html = renderToString(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    expect(html).toContain(`aria-label="${m.common_theme_choose()}"`)
  })

  it("renders tooltip trigger when tooltip is enabled", () => {
    const html = renderToString(
      <ThemeProvider>
        <ThemeToggle tooltip />
      </ThemeProvider>
    )

    expect(html).toContain('data-slot="tooltip-trigger"')
    expect(html).toContain(`aria-label="${m.common_theme_choose()}"`)
  })

  it("renders custom tooltip text when string is provided", () => {
    const html = renderToString(
      <ThemeProvider>
        <ThemeToggle tooltip="Custom Theme Tooltip" />
      </ThemeProvider>
    )

    expect(html).toContain('data-slot="tooltip-trigger"')
  })
})
