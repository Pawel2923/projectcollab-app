import { test, expect } from "@playwright/test"

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("renders navigation bar and brand identity", async ({ page }) => {
    await expect(page.locator("nav")).toBeVisible()
    const brandLink = page.getByRole("link", { name: "ProjectCollab" })
    await expect(brandLink).toBeVisible()
    await expect(brandLink).toHaveAttribute("href", "/")
  })

  test("renders auth actions in navigation", async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip()
    }
    const loginLink = page.getByRole("link", { name: "Zaloguj się" })
    const signupLink = page.getByRole("link", { name: "Zarejestruj się" })

    await expect(loginLink).toBeVisible()
    await expect(loginLink).toHaveAttribute("href", "/signin")
    await expect(signupLink).toBeVisible()
    await expect(signupLink).toHaveAttribute("href", "/signup")
  })

  test("renders hero section with heading and call-to-action", async ({
    page,
  }) => {
    const heroHeading = page.getByRole("heading", {
      name: "Planuj, twórz i współpracuj",
    })
    await expect(heroHeading).toBeVisible()

    const heroSubtext = page.getByText(
      "Zapewnij swojemu zespołowi narzędzia do zarządzania projektami i komunikacji w jednej aplikacji"
    )
    await expect(heroSubtext).toBeVisible()

    const startButton = page.getByRole("link", { name: "Rozpocznij" })
    await expect(startButton).toBeVisible()
    await expect(startButton).toHaveAttribute("href", "/signup")

    const heroImg = page.getByAltText("Podsumowanie projektu")
    await expect(heroImg).toBeVisible()
  })

  test("renders feature sections", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        name: "Organizuj swoją pracę z użyciem intuicyjnego interfejsu",
      })
    ).toBeVisible()
    await expect(page.getByAltText("Przegląd organizacji")).toBeVisible()

    await expect(
      page.getByRole("heading", { name: "Rozmawiaj dzięki czatowi" })
    ).toBeVisible()
    await expect(page.getByAltText("Przykładowy czat")).toBeVisible()

    await expect(
      page.getByRole("heading", {
        name: "Synchronizuj ze swoimi kalendarzami",
      })
    ).toBeVisible()
    await expect(page.getByAltText("Kalendarz projektu")).toBeVisible()
  })

  test("renders footer with copyright and policy links", async ({ page }) => {
    const footer = page.locator("footer").filter({ hasText: "ProjectCollab" })
    await expect(footer).toBeVisible()

    const currentYear = new Date().getFullYear().toString()
    await expect(footer).toContainText(`ProjectCollab © ${currentYear}`)

    const privacyLink = footer.getByRole("link", {
      name: "Polityka prywatności",
    })
    await expect(privacyLink).toBeVisible()
    await expect(privacyLink).toHaveAttribute("href", "/policy/privacy")

    const termsLink = footer.getByRole("link", {
      name: "Warunki korzystania z usługi",
    })
    await expect(termsLink).toBeVisible()
    await expect(termsLink).toHaveAttribute("href", "/policy/terms")
  })
})
