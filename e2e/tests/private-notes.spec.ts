import { expect, test } from "@/support/fixtures";
import { SAMPLE_TEXT, seedPrivateNote, seedText } from "@/support/seed";
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

  test("deletes a note from its list", async ({ page, db, e2e }) => {
    const text = await seedText(db);
    const body = "Delete this note";
    const noteId = await seedPrivateNote(db, text.id, e2e.accountId, {
      body,
      startOffset: 0,
      endOffset: 22,
    });

    await page.goto(`/texts/${text.id}?note=${noteId}`);

    const list = page.getByRole("dialog");
    await expect(list.getByText(body)).toBeVisible();
    await list.getByLabel("Note actions").click();
    await page.getByRole("menuitem", { name: "Delete" }).click();

    const confirm = page.getByRole("dialog").filter({ hasText: "Delete your note?" });
    await confirm.getByRole("button", { name: "Delete" }).click();

    await expect(list.getByText(body)).toHaveCount(0);
    await expect
      .poll(async () => {
        const rows = await db.query<{ count: number }>(
          "SELECT count(*)::int AS count FROM hades_private_notes WHERE id = $1",
          [noteId],
        );
        return rows[0]?.count ?? 0;
      })
      .toBe(0);
  });

  test("shares notes by email", async ({ page, db, e2e }) => {
    const text = await seedText(db);
    const body = "Share this note";
    const noteId = await seedPrivateNote(db, text.id, e2e.accountId, {
      body,
      startOffset: 0,
      endOffset: 22,
    });

    const recipient = "e2e-recipient";
    const existing = await db.query<{ id: string }>(
      "SELECT id FROM gaia_accounts WHERE username = $1",
      [recipient],
    );
    if (existing[0]) {
      await db.deleteReader(existing[0].id);
    }
    const recipientId = await db.createReader(recipient);

    try {
      await page.goto(`/texts/${text.id}`);
      await page.getByRole("link", { name: "Share private notes" }).click();

      const dialog = page.getByRole("dialog").filter({ hasText: "Share private notes" });
      const input = dialog.getByPlaceholder("Search users or add emails…");
      await input.fill(`${recipient}@example.com`);
      await input.press("Enter");
      await expect(dialog.getByText(`${recipient}@example.com`)).toBeVisible();
      await dialog.getByRole("button", { name: "Share" }).click();

      await expect(dialog).toBeHidden();
      await expect
        .poll(async () => {
          const rows = await db.query<{ count: number }>(
            "SELECT count(*)::int AS count FROM gaia_object_shares WHERE object_id = $1",
            [noteId],
          );
          return rows[0]?.count ?? 0;
        })
        .toBe(1);
    } finally {
      await db.query("DELETE FROM gaia_object_shares WHERE object_id = $1", [noteId]);
      await db.deleteReader(recipientId);
    }
  });
});
