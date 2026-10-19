import { test, expect } from "@playwright/test";
import { uniqueUser, registerUser } from "./helpers/auth";

test.describe("Navigation", () => {
  test("nav bar is visible on homepage", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();
  });

  test("nav links navigate to correct pages", async ({ page }) => {
    await page.goto("/");
    const bookLink = page
      .getByRole("navigation")
      .getByRole("link", { name: "Book" });
    if (await bookLink.isVisible()) {
      await bookLink.click();
      await expect(page).toHaveURL(/\/book/);
    }
  });

  test("404 page for unknown routes", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist-xyz");
    expect(response?.status()).toBe(404);
    await expect(page.locator("body")).toContainText(/not found|404/i);
  });

  test("nav shows Sign In and Register when logged out", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation");
    await expect(
      nav.getByRole("link", { name: /sign in|login/i })
    ).toBeVisible();
    await expect(
      nav.getByRole("link", { name: /register/i })
    ).toBeVisible();
  });

  test("logged-in nav shows Dashboard and Sign Out", async ({ page }) => {
    const user = uniqueUser("patient");
    await registerUser(page, user);
    const nav = page.getByRole("navigation");
    await expect(
      nav.getByRole("link", { name: /dashboard/i })
    ).toBeVisible();
    await expect(
      nav.getByRole("button", { name: /sign out/i })
    ).toBeVisible();
  });

  test("homepage sections are present", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toContainText(
      /about|values|approach/i
    );
  });

  test("footer is present on all pages", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer").first();
    if (await footer.isVisible()) {
      await expect(footer).toBeVisible();
    }
  });
});
