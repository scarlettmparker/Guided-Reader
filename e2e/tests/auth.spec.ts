import { expect, test } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("auth", () => {
  test("redirects a guest from the library to login", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/login/);
  });

  test("shows the login form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });
});
