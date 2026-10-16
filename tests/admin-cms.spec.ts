import { test, expect } from "@playwright/test";

test.describe("Admin CMS", () => {
  test.skip(true, "Decap CMS requires GitHub OAuth — skipping in automated E2E");

  test("admin page loads Decap CMS UI", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("body")).toContainText(/decap|cms|admin/i);
  });
});
