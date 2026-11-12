import { test, expect } from "@playwright/test"

test.describe("Theme System (Light, Dark, Auto)", () => {
  test("defaults to auto theme and matches system preference", async ({
    page,
  }) => {
    // Emulate dark color scheme
    await page.emulateMedia({ colorScheme: "dark" })
    await page.goto("/")
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    const html = page.locator("html")
    await expect(html).toHaveClass(/dark/)
    await expect(html).toHaveCSS("color-scheme", "dark")

    // Emulate light color scheme
    await page.emulateMedia({ colorScheme: "light" })
    await expect(html).not.toHaveClass(/dark/)
    await expect(html).toHaveCSS("color-scheme", "light")
  })

  test("switches theme via desktop dropdown menu", async ({
    page,
    isMobile,
  }) => {
    if (isMobile) {
      test.skip()
    }

    await page.goto("/")
    await page.evaluate(() => localStorage.clear())

    const html = page.locator("html")
    const themeTrigger = page.getByRole("button", { name: "Wybierz motyw" })
    await expect(themeTrigger).toBeVisible()

    // Switch to dark
    await themeTrigger.click()
    const darkOption = page.getByRole("menuitem", { name: /Ciemny/i })
    await expect(darkOption).toBeVisible()
    await darkOption.click()

    await expect(html).toHaveClass(/dark/)
    await expect(html).toHaveCSS("color-scheme", "dark")
    const storedThemeDark = await page.evaluate(() =>
      localStorage.getItem("theme")
    )
    expect(storedThemeDark).toBe("dark")

    // Switch to light
    await themeTrigger.click()
    const lightOption = page.getByRole("menuitem", { name: /Jasny/i })
    await expect(lightOption).toBeVisible()
    await lightOption.click()

    await expect(html).not.toHaveClass(/dark/)
    await expect(html).toHaveCSS("color-scheme", "light")
    const storedThemeLight = await page.evaluate(() =>
      localStorage.getItem("theme")
    )
    expect(storedThemeLight).toBe("light")

    // Switch to auto
    await themeTrigger.click()
    const autoOption = page.getByRole("menuitem", { name: /Automatyczny/i })
    await expect(autoOption).toBeVisible()
    await autoOption.click()

    const storedThemeAuto = await page.evaluate(() =>
      localStorage.getItem("theme")
    )
    expect(storedThemeAuto).toBe("auto")
  })

  test("persists selected theme across page reloads", async ({
    page,
    isMobile,
  }) => {
    if (isMobile) {
      test.skip()
    }

    await page.goto("/")
    const html = page.locator("html")
    const themeTrigger = page.getByRole("button", { name: "Wybierz motyw" })

    // Set to dark
    await themeTrigger.click()
    await page.getByRole("menuitem", { name: /Ciemny/i }).click()
    await expect(html).toHaveClass(/dark/)

    // Reload page
    await page.reload()
    await expect(html).toHaveClass(/dark/)
    await expect(html).toHaveCSS("color-scheme", "dark")
  })

  test("cycles themes using keyboard shortcut 'd'", async ({ page }) => {
    await page.goto("/")
    const html = page.locator("html")

    // Start with light mode via UI or localStorage
    await page.evaluate(() => {
      localStorage.setItem("theme", "light")
    })
    await page.reload()
    await expect(html).not.toHaveClass(/dark/)

    // Focus document body to receive key events
    await page.locator("body").click()

    // Press 'd' -> switches from light to dark
    await page.keyboard.press("d")
    await expect(html).toHaveClass(/dark/)
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(
      "dark"
    )

    // Press 'd' -> switches from dark to auto
    await page.keyboard.press("d")
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(
      "auto"
    )

    // Press 'd' -> switches from auto to light
    await page.keyboard.press("d")
    await expect(html).not.toHaveClass(/dark/)
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(
      "light"
    )
  })

  test("switches theme in mobile sheet using segmented toggle", async ({
    page,
    isMobile,
  }) => {
    if (!isMobile) {
      await page.setViewportSize({ width: 390, height: 844 })
    }

    await page.goto("/")
    await page.evaluate(() => localStorage.clear())

    const html = page.locator("html")

    // Open mobile sheet menu
    const menuButton = page.getByRole("button", {
      name: "Otwórz menu nawigacji",
    })
    await expect(menuButton).toBeVisible()
    await menuButton.click()

    // Mobile sheet content should be visible
    const sheet = page.locator('[role="dialog"]')
    await expect(sheet).toBeVisible()

    // Click 'Ciemny' button in segmented control
    const darkSegmentButton = sheet.getByRole("button", { name: "Ciemny" })
    await darkSegmentButton.click()
    await expect(html).toHaveClass(/dark/)
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(
      "dark"
    )

    // Click 'Jasny' button in segmented control
    const lightSegmentButton = sheet.getByRole("button", { name: "Jasny" })
    await lightSegmentButton.click()
    await expect(html).not.toHaveClass(/dark/)
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(
      "light"
    )

    // Click 'Auto' button in segmented control
    const autoSegmentButton = sheet.getByRole("button", { name: "Auto" })
    await autoSegmentButton.click()
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(
      "auto"
    )
  })
})
