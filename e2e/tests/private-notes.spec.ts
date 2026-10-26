import { expect, test } from "@/support/fixtures";
import { SAMPLE_TEXT, seedText } from "@/support/seed";
import { selectTextRange } from "@/support/selection";

test.describe("private notes", () => {
  test("creates a note and shows its author", async ({ page, db, e2e }) => {
    const text = await seedText(db);
    const body = "Remember this phrase";

    await page.goto(`/texts/${text.id}`);
    await selectTextRange(page, SAMPLE_TEXT.content, 22);
    await page.getByText("Private note", { exact: true }).click();

    const dialog = page.getByRole("dialog");
    await dialog.locator('[contenteditable="true"]').fill(body);
    await dialog.getByRole("button", { name: "Create note" }).click();

    await expect(
      page.getByRole("button", { name: "Add another note" }),
    ).toBeVisible();
    await expect(page.getByRole("dialog").getByText(body)).toBeVisible();
    await expect(
      page.getByRole("dialog").getByText(e2e.username),
    ).toBeVisible();
    await expect(page.getByText("Couldn't create note")).toHaveCount(0);

    await expect
      .poll(async () => {
        const rows = await db.query<{ body: string }>(
          "SELECT body FROM hades_private_notes WHERE body = $1",
          [body],
        );
        return rows.length;
      })
      .toBe(1);
  });
});
