import { expect, test } from "@/support/fixtures";
import { APP_URL } from "@/support/env";

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

  test("signs in and lands on the library", async ({ page, e2e }) => {
    await page.goto("/login");
    await page.locator('input[name="username"]').fill(e2e.username);
    await page.locator('input[name="password"]').fill(e2e.password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(`${new URL(APP_URL).origin}/`);
    await expect(page.getByRole("heading", { name: "Continue reading" })).toBeVisible();
  });
});
