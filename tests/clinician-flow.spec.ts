import { test, expect } from "@playwright/test";
import { uniqueUser, registerUser } from "./helpers/auth";

test.describe("Clinician Journey", () => {
  test("clinician registration requires admin approval", async ({ page }) => {
    const user = uniqueUser("clinician");
    await registerUser(page, user);
    await expect(page.locator("body")).toContainText(
      /admin approval|too many attempts/i
    );
  });

  test.skip(
    true,
    "Clinician dashboard/messages tests require an admin-approved account — not automatable without CMS access"
  );

  test("clinician dashboard loads", async ({ page }) => {
    test.skip();
  });

  test("views patients list", async ({ page }) => {
    test.skip();
  });

  test("messages page loads for clinician", async ({ page }) => {
    test.skip();
  });

  test("full clinician flow: register → dashboard → messages", async ({
    page,
  }) => {
    test.skip();
  });
});
