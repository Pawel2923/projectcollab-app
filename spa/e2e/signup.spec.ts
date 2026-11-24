import { test, expect } from "@playwright/test"

test.describe("Sign Up Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./signup")
  })

  test("renders sign up card, back button, brand logo, and social buttons", async ({
    page,
  }) => {
    const backBtn = page.getByRole("button", { name: "Powróć" })
    await expect(backBtn).toBeVisible()
    await expect(backBtn).toHaveAttribute("href", "/spa/")

    await expect(
      page.getByRole("link", { name: "ProjectCollab" })
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "Utwórz konto" })
    ).toBeVisible()
    await expect(
      page.getByText("Zarejestruj się za pomocą konta Microsoft lub Google")
    ).toBeVisible()

    await expect(
      page.getByRole("button", { name: "Zarejestruj się z Microsoft" })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Zarejestruj się z Google" })
    ).toBeVisible()
    await expect(page.getByText("Lub kontynuuj z")).toBeVisible()
  })

  test("validates required fields on submit", async ({ page }) => {
    const submitButton = page.getByRole("button", {
      name: "Zarejestruj się",
      exact: true,
    })
    await submitButton.click()

    await expect(page.getByText("Email jest wymagany")).toBeVisible()
    await expect(page.getByText("Hasło jest wymagane")).toBeVisible()
  })

  test("validates invalid email format", async ({ page }) => {
    await page.locator("#signup-email").fill("invalid-email")
    await page.locator("#signup-password").fill("mypassword")
    await page
      .getByRole("button", { name: "Zarejestruj się", exact: true })
      .click()

    await expect(page.getByText("Nieprawidłowy adres email")).toBeVisible()
  })

  test("toggles password visibility", async ({ page }) => {
    const passwordInput = page.locator("#signup-password")
    await expect(passwordInput).toHaveAttribute("type", "password")

    const toggleButton = page.getByRole("button", { name: "Pokaż hasło" })
    await toggleButton.click()
    await expect(passwordInput).toHaveAttribute("type", "text")

    const hideButton = page.getByRole("button", { name: "Ukryj hasło" })
    await hideButton.click()
    await expect(passwordInput).toHaveAttribute("type", "password")
  })

  test("displays error message when user already exists", async ({ page }) => {
    await page.route("**/core-api/users", async (route) => {
      await route.fulfill({
        status: 422,
        contentType: "application/ld+json",
        body: JSON.stringify({
          violations: [
            {
              propertyPath: "email",
              message: "User with this email already exists",
            },
          ],
        }),
      })
    })

    await page.locator("#signup-email").fill("existing@example.com")
    await page.locator("#signup-password").fill("StrongPassword123!")
    await page
      .getByRole("button", { name: "Zarejestruj się", exact: true })
      .click()

    await expect(
      page.getByText("Użytkownik o tym adresie email już istnieje.")
    ).toBeVisible()
  })

  test("renders navigation links to signin and policy pages", async ({
    page,
  }) => {
    const signinLink = page.getByRole("link", { name: "Zaloguj się" })
    await expect(signinLink).toBeVisible()
    await expect(signinLink).toHaveAttribute("href", "/spa/signin")

    const termsLink = page.getByRole("link", {
      name: "Warunki korzystania z usługi",
    })
    await expect(termsLink).toBeVisible()
    await expect(termsLink).toHaveAttribute(
      "href",
      "/spa/policy/terms?referer=%2Fsignup"
    )

    const privacyLink = page.getByRole("link", {
      name: "Politykę prywatności",
    })
    await expect(privacyLink).toBeVisible()
    await expect(privacyLink).toHaveAttribute(
      "href",
      "/spa/policy/privacy?referer=%2Fsignup"
    )
  })
})
