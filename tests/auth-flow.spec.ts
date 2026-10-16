import { test, expect } from "@playwright/test";
import {
  uniqueUser,
  registerUser,
  loginUser,
  logoutUser,
} from "./helpers/auth";

test.describe("Authentication", () => {
  test("login page renders with form fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign in/i })
    ).toBeVisible();
  });

  test("register page renders with form fields", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="tel"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: /patient/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /clinician/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /create account/i })
    ).toBeVisible();
  });

  test("register → login → logout cycle works", async ({ page }) => {
    const user = uniqueUser("patient");

    // Register
    await registerUser(page, user);
    expect(page.url()).toContain("/dashboard");

    // Logout
    await logoutUser(page);
    expect(page.url()).toBe("http://localhost:3004/");
    await expect(
      page
        .getByRole("navigation")
        .getByRole("link", { name: /sign in|login/i })
    ).toBeVisible();

    // Login
    await loginUser(page, user.email, user.password);
    expect(page.url()).toContain("/dashboard");
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[type="email"]').fill("nonexistent@example.com");
    await page.locator('input[type="password"]').fill("wrongpassword");
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
    await expect(page.locator("body")).toContainText(
      /invalid|error|incorrect|wrong/i
    );
  });

  test("unauthenticated access to /dashboard redirects to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    expect(page.url()).toContain("/login");
  });

  test("clinician registration requires admin approval", async ({ page }) => {
    const user = uniqueUser("clinician");
    await page.goto("/register");
    await page.locator('input[type="text"]').first().fill(user.name);
    await page.locator('input[type="email"]').first().fill(user.email);
    await page.locator('input[type="tel"]').first().fill(user.phone);
    await page.locator('input[type="password"]').first().fill(user.password);
    await page.locator('button:has-text("clinician")').click();
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1500);
    await expect(page.locator("body")).toContainText(
      /admin approval|too many attempts/i
    );
  });
});
