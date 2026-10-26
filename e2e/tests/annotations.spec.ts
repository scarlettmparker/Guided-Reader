import { expect, test } from "@/support/fixtures";
import { SAMPLE_TEXT, seedAnnotation, seedText } from "@/support/seed";
import { selectTextRange } from "@/support/selection";

test.describe("annotations", () => {
  test("creates an annotation and shows it", async ({ page, db, e2e }) => {
    const text = await seedText(db);
    const body = "A useful opening phrase";

    await page.goto(`/texts/${text.id}`);
    await selectTextRange(page, SAMPLE_TEXT.content, 22);
    await page.getByText("Click to annotate").first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.locator('[contenteditable="true"]').fill(body);
    await dialog.getByRole("button", { name: "Click to annotate" }).click();

    await expect(page.locator("mark").first()).toBeVisible();
    await expect(page.getByRole("dialog").getByText(body)).toBeVisible();
    await expect(
      page.getByRole("dialog").getByText(e2e.username),
    ).toBeVisible();

    await expect
      .poll(async () => {
        const rows = await db.query<{ body: string }>(
          "SELECT body FROM hades_reader_annotations WHERE body = $1",
          [body],
        );
        return rows.length;
      })
      .toBe(1);
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
    await page
      .getByRole("dialog")
      .last()
      .getByRole("button", { name: "Delete" })
      .click();

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
