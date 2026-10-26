import { expect, test } from "@/support/fixtures";
import { APP_URL } from "@/support/env";

test.describe("smoke", () => {
  test("loads the library for a signed-in reader", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(`${new URL(APP_URL).origin}/`);
    await expect(page.getByRole("heading", { name: "Continue reading" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Texts" })).toBeVisible();
  });
});
