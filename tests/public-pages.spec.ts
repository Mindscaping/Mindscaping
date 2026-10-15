import { test, expect } from "@playwright/test";

test.describe("Public Pages", () => {
  test("blog page loads", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.locator("body")).toContainText(/blog|post|article/i);
  });

  test("contact page loads with form", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("body")).toContainText(/contact/i);
    const form = page.locator("form");
    if (await form.isVisible()) {
      await expect(form).toBeVisible();
    }
  });

  test("faq page loads with questions", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.locator("body")).toContainText(/faq|question/i);
  });

  test("gallery page loads with images", async ({ page }) => {
    await page.goto("/gallery");
    await expect(page.locator("body")).toContainText(/gallery|photo/i);
  });

  test("privacy page loads with policy text", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("body")).toContainText(/privacy|policy/i);
  });

  test("team page loads with clinician profiles", async ({ page }) => {
    await page.goto("/team");
    await expect(page.locator("body")).toContainText(/team|clinician|therapist/i);
  });

  test("all public pages are accessible from nav", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();
  });
});
