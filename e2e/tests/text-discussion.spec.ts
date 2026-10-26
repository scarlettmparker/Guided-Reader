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
    await discussion.locator("[contenteditable]").fill(body);
    await discussion.getByRole("button", { name: "Comment" }).click();

    const post = discussion.locator("li").filter({ hasText: body });
    await expect(post).toBeVisible();
    await expect(post.getByText(e2e.username)).toBeVisible();
    await expect(post.getByRole("img", { name: e2e.username })).toBeVisible();

    await post.getByRole("button", { name: "Vote up" }).click();
    await expect(post.getByRole("button", { name: "Vote up" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(post.getByText("1", { exact: true })).toBeVisible();

    await page.reload();

    const reloaded = page.getByRole("article").filter({ hasText: "Text discussion" });
    const reloadedPost = reloaded.locator("li").filter({ hasText: body });
    await expect(reloadedPost.getByText(e2e.username)).toBeVisible();
    await expect(reloadedPost.getByRole("button", { name: "Vote up" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(reloadedPost.getByText("1", { exact: true })).toBeVisible();

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
