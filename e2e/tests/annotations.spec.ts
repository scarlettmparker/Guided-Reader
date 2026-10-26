import type { Page } from "@playwright/test";

import { expect, test } from "@/support/fixtures";
import { SAMPLE_TEXT, seedAnnotation, seedText } from "@/support/seed";

/**
 * Selects the first part of the sample text and opens the annotation tooltip.
 *
 * @param page the Playwright page
 */
async function selectSampleText(page: Page): Promise<void> {
  const text = page.getByText(SAMPLE_TEXT.content, { exact: true }).first();

  await text.evaluate((element, length) => {
    const node = element.firstChild;
    if (!node) throw new Error("Missing text node");

    const range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, length);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  }, 22);
}

test.describe("annotations", () => {
  test("creates an annotation from a selection", async ({ page, db }) => {
    const text = await seedText(db);
    const body = "A useful opening phrase";

    await page.goto(`/texts/${text.id}`);
    await selectSampleText(page);
    await page.getByText("Click to annotate").first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.locator('[contenteditable="true"]').fill(body);
    await dialog.getByRole("button", { name: "Click to annotate" }).click();

    await expect
      .poll(async () => {
        const rows = await db.query<{ body: string }>(
          "SELECT body FROM hades_reader_annotations WHERE body = $1",
          [body],
        );
        return rows.length;
      })
      .toBe(1);

    await page.reload();
    await expect(page.locator("mark").first()).toBeVisible();
  });

  test("deletes an annotation from its list", async ({ page, db, e2e }) => {
    const text = await seedText(db);
    const body = "Delete this annotation";
    const { positionId } = await seedAnnotation(db, text.id, e2e.accountId, {
      body,
      startOffset: 0,
      endOffset: 22,
    });

    await page.goto(`/texts/${text.id}?annotation=${positionId}`);

    const list = page.getByRole("dialog");
    await expect(list.getByText(body)).toBeVisible();
    await list.getByLabel("Annotation actions").click();
    await page.getByRole("menuitem", { name: "Delete" }).click();
    await page.getByRole("dialog").last().getByRole("button", { name: "Delete" }).click();

    await expect
      .poll(async () => {
        const rows = await db.query<{ count: number }>(
          "SELECT count(*)::int AS count FROM hades_reader_annotations WHERE body = $1",
          [body],
        );
        return rows[0]?.count ?? 0;
      })
      .toBe(0);
  });
});
