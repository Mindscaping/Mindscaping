import { test, expect } from "@playwright/test";
import { uniqueUser, registerUser } from "./helpers/auth";
import { BOOKING_FORM } from "./helpers/selectors";

test.describe("Patient Journey", () => {
  test("browses homepage", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /mindscaping/i })
    ).toBeVisible();
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(page.getByText(/mindful healing/i)).toBeVisible();
  });

  test("sees nav links before login", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation");
    await expect(
      nav.getByRole("link", { name: /sign in|login/i })
    ).toBeVisible();
    await expect(
      nav.getByRole("link", { name: /register/i })
    ).toBeVisible();
  });

  test("full patient flow: register → book → dashboard → messages", async ({
    page,
  }) => {
    const user = uniqueUser("patient");

    // Register
    await registerUser(page, user);
    expect(page.url()).toContain("/dashboard");

    // Dashboard
    await expect(page.locator("body")).toContainText(/dashboard/i);

    // Book
    await page.goto("/book");
    await expect(page.getByLabel(BOOKING_FORM.name)).toBeVisible();
    await page.getByLabel(BOOKING_FORM.name).fill(user.name);
    await page.getByLabel(BOOKING_FORM.email).fill(user.email);
    await page.getByLabel(BOOKING_FORM.phone).fill(user.phone);
    await page.getByLabel(BOOKING_FORM.sessionType).selectOption("individual");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    while (tomorrow.getDay() === 0) tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];
    await page.getByLabel(BOOKING_FORM.date).fill(dateStr);
    await page.waitForTimeout(500);
    const timeSelect = page.getByLabel(BOOKING_FORM.time);
    if (await timeSelect.isEnabled()) {
      await timeSelect.selectOption({ index: 1 });
    }
    await page.getByLabel(BOOKING_FORM.notes).fill(
      "First session, feeling anxious about work stress"
    );
    await page.getByRole("button", { name: BOOKING_FORM.submit }).click();
    await page.waitForTimeout(2000);

    // Messages
    await page.goto("/messages");
    await expect(page.locator("body")).toContainText(/message|conversation/i);
  });
});
