import { resetAppCache } from "@/support/app";
import { expect, test } from "@/support/fixtures";
import { APP_URL } from "@/support/env";
import { SAMPLE_TEXT, seedText } from "@/support/seed";

test.describe("library", () => {
  test("lists a seeded text on the home page", async ({ page, db }) => {
    await seedText(db);
    await resetAppCache(page.request);

    await page.goto("/");

    const recent = page.getByRole("article").filter({ hasText: "Recent texts" });
    await expect(recent.getByRole("link", { name: SAMPLE_TEXT.title })).toBeVisible();
  });

  test("opens a text from the library", async ({ page, db }) => {
    const text = await seedText(db);
    const origin = new URL(APP_URL).origin;
    await resetAppCache(page.request);

    await page.goto("/");
    const recent = page.getByRole("article").filter({ hasText: "Recent texts" });
    await recent.locator(`a[href="/texts/${text.id}"]`).click();

    await expect(page).toHaveURL(`${origin}/texts/${text.id}`);
    await expect(page.getByRole("heading", { name: SAMPLE_TEXT.title })).toBeVisible();
    await expect(page.getByText(SAMPLE_TEXT.content)).toBeVisible();
  });
});
