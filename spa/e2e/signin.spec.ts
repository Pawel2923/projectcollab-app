import { test, expect } from "@playwright/test"

test.describe("Sign In Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./signin")
  })

  test("renders sign in card, brand logo, and social buttons", async ({
    page,
  }) => {
    await expect(
      page.getByRole("link", { name: "ProjectCollab" })
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "Witaj ponownie" })
    ).toBeVisible()
    await expect(
      page.getByText("Zaloguj się za pomocą konta Microsoft lub Google")
    ).toBeVisible()

    await expect(
      page.getByRole("button", { name: "Zaloguj się z Microsoft" })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Zaloguj się z Google" })
    ).toBeVisible()
    await expect(page.getByText("Lub kontynuuj z")).toBeVisible()
  })

  test("validates required fields on submit", async ({ page }) => {
    const submitButton = page.getByRole("button", { name: "Zaloguj się" })
    await submitButton.click()

    await expect(page.getByText("Email jest wymagany")).toBeVisible()
    await expect(page.getByText("Hasło jest wymagane")).toBeVisible()
  })

  test("validates invalid email format", async ({ page }) => {
    await page.locator("#signin-email").fill("invalid-email")
    await page.locator("#signin-password").fill("mypassword")
    await page.getByRole("button", { name: "Zaloguj się" }).click()

    await expect(page.getByText("Nieprawidłowy adres email")).toBeVisible()
  })

  test("toggles password visibility", async ({ page }) => {
    const passwordInput = page.locator("#signin-password")
    await expect(passwordInput).toHaveAttribute("type", "password")

    const toggleButton = page.getByRole("button", { name: "Pokaż hasło" })
    await toggleButton.click()
    await expect(passwordInput).toHaveAttribute("type", "text")

    const hideButton = page.getByRole("button", { name: "Ukryj hasło" })
    await hideButton.click()
    await expect(passwordInput).toHaveAttribute("type", "password")
  })

  test("displays error message on invalid credentials", async ({ page }) => {
    await page.route("**/core-api/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Invalid credentials." }),
      })
    })

    await page.locator("#signin-email").fill("test@example.com")
    await page.locator("#signin-password").fill("wrongpassword")
    await page.getByRole("button", { name: "Zaloguj się" }).click()

    await expect(
      page.getByText("Nieprawidłowy e-mail lub hasło.")
    ).toBeVisible()
  })

  test("renders navigation links to signup and policy pages", async ({
    page,
  }) => {
    const signupLink = page.getByRole("link", { name: "Zarejestruj się" })
    await expect(signupLink).toBeVisible()
    await expect(signupLink).toHaveAttribute("href", "/spa/signup")

    const forgotPasswordLink = page.getByRole("link", {
      name: "Zapomniałeś hasła?",
    })
    await expect(forgotPasswordLink).toBeVisible()
    await expect(forgotPasswordLink).toHaveAttribute("href", "/reset-password")

    const termsLink = page.getByRole("link", {
      name: "Warunki korzystania z usługi",
    })
    await expect(termsLink).toBeVisible()
    await expect(termsLink).toHaveAttribute(
      "href",
      "/spa/policy/terms?referer=%2Fsignin"
    )

    const privacyLink = page.getByRole("link", {
      name: "Politykę prywatności",
    })
    await expect(privacyLink).toBeVisible()
    await expect(privacyLink).toHaveAttribute(
      "href",
      "/spa/policy/privacy?referer=%2Fsignin"
    )
  })
})
