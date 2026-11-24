import { test, expect } from "@playwright/test"

test.use({ locale: "pl-PL" })

test.describe("Email Verification Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/core-api/users/me", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Unauthorized" }),
      })
    })
    await page.route("**/core-api/auth/refresh", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Unauthorized" }),
      })
    })
  })

  test("renders /verify-email with email input fallback when identity is unknown and validates/submits resend", async ({
    page,
  }) => {
    let sentBody: unknown = null
    await page.route("**/core-api/verify-email/send", async (route) => {
      sentBody = route.request().postDataJSON()
      await route.fulfill({
        status: 202,
        contentType: "application/ld+json",
        body: JSON.stringify({ code: "VERIFY_EMAIL_SENT" }),
      })
    })

    await page.goto("./verify-email")

    await expect(
      page.getByRole("heading", { name: "Zweryfikuj email" })
    ).toBeVisible()

    const resendBtn = page.getByRole("button", {
      name: "Wyślij ponownie email weryfikacyjny",
    })
    await resendBtn.click()
    await expect(page.getByText("Email jest wymagany")).toBeVisible()

    await page.locator("#resend-verify-email").fill("not-an-email")
    await resendBtn.click()
    await expect(page.getByText("Nieprawidłowy adres email")).toBeVisible()

    await page.locator("#resend-verify-email").fill("user@example.com")
    await resendBtn.click()

    await expect(
      page.getByText(
        "Jeśli email jest zarejestrowany, link weryfikacyjny został wysłany."
      )
    ).toBeVisible()
    expect(sentBody).toEqual({ email: "user@example.com" })
    await expect(resendBtn).toBeDisabled()
  })

  test("uses stored session identity on /verify-email without showing email input and handles rate limiting", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem(
        "auth_created_identity",
        "registered@example.com"
      )
    })

    await page.route("**/core-api/verify-email/send", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/ld+json",
        body: JSON.stringify({ detail: "Too many requests" }),
      })
    })

    await page.goto("./verify-email")

    await expect(
      page.getByText(
        "Wysłaliśmy link weryfikacyjny na adres registered@example.com."
      )
    ).toBeVisible()
    await expect(page.locator("#resend-verify-email")).toHaveCount(0)

    const resendBtn = page.getByRole("button", {
      name: "Wyślij ponownie email weryfikacyjny",
    })
    await resendBtn.click()

    await expect(
      page.getByText("Zbyt wiele żądań. Spróbuj ponownie później.")
    ).toBeVisible()
    await expect(resendBtn).toBeDisabled()
  })

  test("shows already-verified state on /verify-email when authenticated user is already verified", async ({
    page,
  }) => {
    await page.unroute("**/core-api/users/me")
    await page.route("**/core-api/users/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/ld+json",
        body: JSON.stringify({
          id: 7,
          email: "verified@example.com",
          roles: ["ROLE_USER"],
          isVerified: true,
        }),
      })
    })

    await page.goto("./verify-email")

    await expect(
      page.getByRole("heading", { name: "Email jest już zweryfikowany" })
    ).toBeVisible()
    const goToAppBtn = page.getByRole("button", {
      name: "Przejdź do aplikacji",
    })
    await expect(goToAppBtn).toBeVisible()
    await expect(goToAppBtn).toHaveAttribute("href", "/spa/organizations")
  })

  test("shows invalid link error on /verify-email/verify without calling API when query params are incomplete", async ({
    page,
  }) => {
    let apiCallCount = 0
    await page.route("**/core-api/verify-email?*", async (route) => {
      apiCallCount += 1
      await route.fulfill({ status: 200, body: "{}" })
    })

    await page.goto("./verify-email/verify?id=42&expires=1799999999")

    await expect(
      page.getByRole("heading", { name: "Nieprawidłowy link weryfikacyjny" })
    ).toBeVisible()
    expect(apiCallCount).toBe(0)

    const requestNewLink = page.getByRole("button", {
      name: "Poproś o nowy link weryfikacyjny",
    })
    await expect(requestNewLink).toHaveAttribute("href", "/spa/verify-email")
  })

  test("verifies email once via POST /core-api/verify-email, clears stored identity, and shows success state", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem(
        "auth_created_identity",
        "pending@example.com"
      )
    })

    let requestCount = 0
    let requestMethod = ""
    let requestUrl = ""
    await page.route("**/core-api/verify-email?*", async (route) => {
      requestCount += 1
      requestMethod = route.request().method()
      requestUrl = route.request().url()
      await route.fulfill({
        status: 200,
        contentType: "application/ld+json",
        body: JSON.stringify({
          code: "EMAIL_VERIFIED",
          isVerified: true,
        }),
      })
    })

    await page.goto(
      "./verify-email/verify?id=42&expires=1799999999&signature=sig123&token=tok456"
    )

    await expect(
      page.getByRole("heading", { name: "Email zweryfikowany" })
    ).toBeVisible()
    expect(requestCount).toBe(1)
    expect(requestMethod).toBe("POST")
    expect(requestUrl).toContain("id=42")
    expect(requestUrl).toContain("expires=1799999999")
    expect(requestUrl).toContain("signature=sig123")
    expect(requestUrl).toContain("token=tok456")

    const storedAfter = await page.evaluate(() =>
      window.sessionStorage.getItem("auth_created_identity")
    )
    expect(storedAfter).toBeNull()

    await expect(
      page.getByRole("button", { name: "Zaloguj się" })
    ).toHaveAttribute("href", "/spa/signin")
  })

  test("shows user not found error when API returns USER_NOT_FOUND", async ({
    page,
  }) => {
    await page.route("**/core-api/verify-email?*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/ld+json",
        body: JSON.stringify({
          code: "USER_NOT_FOUND",
          isVerified: false,
        }),
      })
    })

    await page.goto(
      "./verify-email/verify?id=999&expires=1799999999&signature=sig&token=tok"
    )

    await expect(
      page.getByRole("heading", { name: "Nie znaleziono użytkownika" })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Utwórz konto" })
    ).toHaveAttribute("href", "/spa/signup")
  })

  test("allows retrying after transient server error on /verify-email/verify", async ({
    page,
  }) => {
    let attempt = 0
    await page.route("**/core-api/verify-email?*", async (route) => {
      attempt += 1
      if (attempt === 1) {
        await route.fulfill({
          status: 500,
          contentType: "application/ld+json",
          body: JSON.stringify({ detail: "Internal server error" }),
        })
        return
      }
      await route.fulfill({
        status: 200,
        contentType: "application/ld+json",
        body: JSON.stringify({
          code: "EMAIL_VERIFIED",
          isVerified: true,
        }),
      })
    })

    await page.goto(
      "./verify-email/verify?id=42&expires=1799999999&signature=sig&token=tok"
    )

    await expect(
      page.getByRole("heading", { name: "Błąd weryfikacji email" })
    ).toBeVisible()

    await page.getByRole("button", { name: "Spróbuj ponownie" }).click()

    await expect(
      page.getByRole("heading", { name: "Email zweryfikowany" })
    ).toBeVisible()
    expect(attempt).toBe(2)
  })
})
