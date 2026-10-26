import { expect, test } from "@/support/fixtures";
import { seedAnnotation, seedComment, seedText } from "@/support/seed";

test.describe("comments", () => {
  test("adds a reply and shows its author", async ({ page, db, e2e }) => {
    const text = await seedText(db);
    const body = "I had the same thought";
    const existing = "An earlier reply";
    const { annotationId, positionId } = await seedAnnotation(
      db,
      text.id,
      e2e.accountId,
      {
        body: "Opening phrase",
        startOffset: 0,
        endOffset: 22,
      },
    );
    await seedComment(db, annotationId, e2e.accountId, { body: existing });

    await page.goto(`/texts/${text.id}?annotation=${positionId}`);

    const list = page.getByRole("dialog");
    await expect(list).toBeVisible();
    await list.getByText("Reply", { exact: true }).click();
    await list.locator('[contenteditable="true"]').fill(body);
    await list.getByRole("button", { name: "Comment" }).click();

    const replies = list.getByRole("button", { name: "2 replies" });
    await expect(replies).toBeVisible();
    await replies.click();

    const replyList = list.locator("ul").last();
    const reply = replyList.locator("li").filter({ hasText: body });
    await expect(reply).toBeVisible();
    await expect(reply.getByText(e2e.username)).toBeVisible();
    await expect(reply.getByRole("img", { name: e2e.username })).toBeVisible();
    await expect(
      replyList.locator("li").filter({ hasText: existing }),
    ).toBeVisible();

    await expect
      .poll(async () => {
        const rows = await db.query<{ body: string }>(
          "SELECT body FROM hades_reader_comments WHERE body = $1",
          [body],
        );
        return rows.length;
      })
      .toBe(1);
  });

  test("deletes a reply from an annotation", async ({ page, db, e2e }) => {
    const text = await seedText(db);
    const body = "Delete this reply";
    const { annotationId, positionId } = await seedAnnotation(
      db,
      text.id,
      e2e.accountId,
      {
        body: "Opening phrase",
        startOffset: 0,
        endOffset: 22,
      },
    );
    await seedComment(db, annotationId, e2e.accountId, { body });

    await page.goto(`/texts/${text.id}?annotation=${positionId}`);

    const list = page.getByRole("dialog");
    await list.getByText("1 reply").click();
    await expect(list.getByText(body)).toBeVisible();
    await list.getByLabel("Comment actions").click();
    await page.getByRole("menuitem", { name: "Delete" }).click();
    await page
      .getByRole("dialog")
      .last()
      .getByRole("button", { name: "Delete" })
      .click();

    await expect
      .poll(async () => {
        const rows = await db.query<{ count: number }>(
          "SELECT count(*)::int AS count FROM hades_reader_comments WHERE body = $1",
          [body],
        );
        return rows[0]?.count ?? 0;
      })
      .toBe(0);
  });
});
