import { test, expect, type Page } from "@playwright/test"

const AUTHENTICATED_USER = {
  "@id": "/core-api/users/42",
  "@type": "User",
  id: 42,
  email: "john.doe@example.com",
  username: "John Doe",
  roles: ["ROLE_USER"],
  isVerified: true,
}

async function mockAuthenticatedSession(
  page: Page,
  options: { logoutStatus?: number } = {}
) {
  const { logoutStatus = 204 } = options
  let isAuthenticated = true
  let logoutCalls = 0

  await page.route("**/core-api/users/me", async (route) => {
    if (isAuthenticated) {
      await route.fulfill({
        status: 200,
        contentType: "application/ld+json",
        body: JSON.stringify(AUTHENTICATED_USER),
      })
    } else {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Unauthorized" }),
      })
    }
  })

  await page.route("**/core-api/auth/refresh", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ message: "No refresh token" }),
    })
  })

  await page.route("**/core-api/auth/logout", async (route) => {
    logoutCalls += 1
    isAuthenticated = false
    await route.fulfill({
      status: logoutStatus,
      body: logoutStatus === 204 ? "" : JSON.stringify({ detail: "Error" }),
    })
  })

  return {
    getLogoutCalls: () => logoutCalls,
  }
}

test.describe("Logout flow", () => {
  test("logs out from desktop user settings menu and redirects to /spa/signin", async ({
    page,
    isMobile,
  }) => {
    if (isMobile) {
      test.skip()
    }

    const session = await mockAuthenticatedSession(page)

    await page.goto("./")

    const userMenuTrigger = page.getByRole("button", {
      name: /John Doe/i,
    })
    await expect(userMenuTrigger).toBeVisible()
    await userMenuTrigger.click()

    const logoutItem = page.getByRole("menuitem", { name: "Wyloguj się" })
    await expect(logoutItem).toBeVisible()
    await logoutItem.click()

    await expect(page).toHaveURL(/\/spa\/signin$/)
    await expect(
      page.getByRole("heading", { name: "Witaj ponownie" })
    ).toBeVisible()
    expect(session.getLogoutCalls()).toBe(1)

    // Verify protected route is no longer accessible after logout
    await page.goto("./organizations")
    await expect(page).toHaveURL(/\/spa\/signin\?redirectUrl=%2Forganizations/)
  })

  test("logs out from mobile navigation menu and redirects to /spa/signin", async ({
    page,
    isMobile,
  }) => {
    if (!isMobile) {
      test.skip()
    }

    const session = await mockAuthenticatedSession(page)

    await page.goto("./")

    const openMenuButton = page.getByRole("button", {
      name: "Otwórz menu nawigacji",
    })
    await expect(openMenuButton).toBeVisible()
    await openMenuButton.click()

    const logoutButton = page.getByRole("button", { name: "Wyloguj się" })
    await expect(logoutButton).toBeVisible()
    await logoutButton.click()

    await expect(page).toHaveURL(/\/spa\/signin$/)
    expect(session.getLogoutCalls()).toBe(1)
  })

  test("logs out when navigating directly to /spa/logout", async ({ page }) => {
    const session = await mockAuthenticatedSession(page)

    await page.goto("./logout")

    await expect(page).toHaveURL(/\/spa\/signin$/)
    await expect(
      page.getByRole("heading", { name: "Witaj ponownie" })
    ).toBeVisible()
    expect(session.getLogoutCalls()).toBe(1)
  })

  test("clears local session and redirects to /spa/signin even if backend logout fails", async ({
    page,
  }) => {
    const session = await mockAuthenticatedSession(page, { logoutStatus: 500 })

    await page.goto("./logout")

    await expect(page).toHaveURL(/\/spa\/signin$/)
    await expect(
      page.getByRole("heading", { name: "Witaj ponownie" })
    ).toBeVisible()
    expect(session.getLogoutCalls()).toBe(1)
  })
})
