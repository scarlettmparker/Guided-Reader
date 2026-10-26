import { expect, test } from "@/support/fixtures";
import { seedText } from "@/support/seed";

test.describe("text discussion", () => {
  test("adds a comment and shows its author ", async ({ page, db, e2e }) => {
    const text = await seedText(db);
    const body = "A thought about this text";

    await page.goto(`/texts/${text.id}`);

    const discussion = page
      .getByRole("article")
      .filter({ hasText: "Text discussion" });
    await discussion.locator('[contenteditable="true"]').fill(body);
    await discussion.getByRole("button", { name: "Comment" }).click();

    const post = discussion.locator("li").filter({ hasText: body });
    await expect(post).toBeVisible();
    await expect(post.getByText(e2e.username)).toBeVisible();
    await expect(post.getByRole("img", { name: e2e.username })).toBeVisible();

    await expect
      .poll(async () => {
        const rows = await db.query<{ body: string }>(
          "SELECT body FROM icarus_forum_posts WHERE body = $1",
          [body],
        );
        return rows.length;
      })
      .toBe(1);
  });
});
