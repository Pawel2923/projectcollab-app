import { test, expect } from "@playwright/test"

test.describe("Privacy Policy Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/policy/privacy")
  })

  test("renders without console errors", async ({ page }) => {
    const consoleErrors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        if (!msg.text().includes("404")) {
          consoleErrors.push(msg.text())
        }
      }
    })
    await page.goto("/policy/privacy")
    await page.waitForTimeout(500)
    expect(consoleErrors).toEqual([])
  })

  test("renders main heading and sections", async ({ page }) => {
    const heading = page.getByRole("heading", {
      level: 1,
      name: "Polityka prywatności",
    })
    await expect(heading).toBeVisible()

    await expect(
      page.getByRole("heading", { level: 2, name: "1. Postanowienia ogólne" })
    ).toBeVisible()
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "2. Zakres przetwarzanych danych osobowych",
      })
    ).toBeVisible()
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "10. Zmiany polityki prywatności",
      })
    ).toBeVisible()

    await expect(page.getByText("Paweł Poremba")).toBeVisible()
    await expect(page.getByText("projectcollab@nis-lab.com")).toBeVisible()
  })

  test("renders back button linking to home by default", async ({ page }) => {
    const backBtn = page.getByRole("button", { name: "Powróć" })
    await expect(backBtn).toBeVisible()
    await expect(backBtn).toHaveAttribute("href", "/")
    await expect(backBtn).toHaveClass(/bg-background/)
  })

  test("renders back button linking to referer when specified", async ({
    page,
  }) => {
    await page.goto("/policy/privacy?referer=/signin")
    const backBtn = page.getByRole("button", { name: "Powróć" })
    await expect(backBtn).toBeVisible()
    await expect(backBtn).toHaveAttribute("href", "/signin")
  })

  test("renders footer with version date", async ({ page }) => {
    const footer = page.locator("footer")
    await expect(footer).toBeVisible()
    await expect(footer).toContainText(
      "Polityka prywatności ProjectCollab – wersja z dnia 14.12.2025 r."
    )
  })
})

test.describe("Terms of Service Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/policy/terms")
  })

  test("renders without console errors", async ({ page }) => {
    const consoleErrors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        if (!msg.text().includes("404")) {
          consoleErrors.push(msg.text())
        }
      }
    })
    await page.goto("/policy/terms")
    await page.waitForTimeout(500)
    expect(consoleErrors).toEqual([])
  })

  test("renders main heading and sections", async ({ page }) => {
    const heading = page.getByRole("heading", {
      level: 1,
      name: "Warunki korzystania z ProjectCollab",
    })
    await expect(heading).toBeVisible()

    await expect(
      page.getByRole("heading", { level: 2, name: "1. Postanowienia ogólne" })
    ).toBeVisible()
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "2. Charakter ProjectCollab",
      })
    ).toBeVisible()
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "7. Postanowienia końcowe",
      })
    ).toBeVisible()
  })

  test("renders back button linking to home by default", async ({ page }) => {
    const backBtn = page.getByRole("button", { name: "Powróć" })
    await expect(backBtn).toBeVisible()
    await expect(backBtn).toHaveAttribute("href", "/")
    await expect(backBtn).toHaveClass(/bg-background/)
  })

  test("renders back button linking to referer when specified", async ({
    page,
  }) => {
    await page.goto("/policy/terms?referer=/signup")
    const backBtn = page.getByRole("button", { name: "Powróć" })
    await expect(backBtn).toBeVisible()
    await expect(backBtn).toHaveAttribute("href", "/signup")
  })

  test("renders footer with version date", async ({ page }) => {
    const footer = page.locator("footer")
    await expect(footer).toBeVisible()
    await expect(footer).toContainText(
      "Warunki korzystania z ProjectCollab – wersja z dnia 14.12.2025 r."
    )
  })
})
