import { resetAppCache } from "@/support/app";
import { expect, test } from "@/support/fixtures";
import { SAMPLE_TEXT, seedText } from "@/support/seed";

test.describe("texts", () => {
  test("shows the text content and metadata", async ({ page, db }) => {
    const text = await seedText(db);

    await page.goto(`/texts/${text.id}`);

    await expect(page.getByRole("heading", { name: SAMPLE_TEXT.title })).toBeVisible();
    await expect(page.getByText(`${SAMPLE_TEXT.level} · ${SAMPLE_TEXT.language}`)).toBeVisible();
    await expect(page.getByText(SAMPLE_TEXT.content)).toBeVisible();
  });

  test("lists the text on the texts page", async ({ page, db }) => {
    await seedText(db);
    await resetAppCache(page.request);

    await page.goto("/texts");

    await expect(page.getByRole("link", { name: SAMPLE_TEXT.title })).toBeVisible();
  });
});
