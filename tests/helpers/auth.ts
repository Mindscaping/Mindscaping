import { type Page, expect } from "@playwright/test";

export interface TestUser {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "patient" | "clinician";
}

let userCounter = 0;

export function uniqueUser(role: "patient" | "clinician"): TestUser {
  userCounter++;
  const ts = Date.now();
  return {
    name: role === "patient" ? "Test Patient" : "Dr. Test Clinician",
    email: `test-${role}-${ts}-${userCounter}@example.com`,
    phone: `9${String(100000000 + userCounter).slice(0, 9)}`,
    password: "TestPass123!",
    role,
  };
}

export async function registerUser(page: Page, user: TestUser): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await page.waitForTimeout(5000);
    await page.goto("/register");
    await page.locator('input[type="text"]').first().fill(user.name);
    await page.locator('input[type="email"]').first().fill(user.email);
    await page.locator('input[type="tel"]').first().fill(user.phone);
    await page.locator('input[type="password"]').first().fill(user.password);
    await page.locator(`button:has-text("${user.role}")`).click();
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1500);

    const body = await page.locator("body").textContent();
    if (body?.includes("Too many attempts")) continue;

    if (user.role === "clinician") {
      await expect(page.locator("body")).toContainText(/admin approval/i);
      return;
    }

    if (page.url().includes("/dashboard")) {
      await page.reload();
      await page.waitForTimeout(1000);
      return;
    }
  }
  throw new Error(`Registration failed for ${user.email} after retries`);
}

export async function loginUser(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto("/login");
  await page.locator('input[type="email"]').first().fill(email);
  await page.locator('input[type="password"]').first().fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
  await page.reload();
  await page.waitForTimeout(1000);
}

export async function logoutUser(page: Page): Promise<void> {
  const signOut = page
    .getByRole("navigation")
    .getByRole("button", { name: /sign out/i });
  if (await signOut.isVisible()) {
    await signOut.click();
    await page.waitForURL("/", { timeout: 10_000 });
  }
}
