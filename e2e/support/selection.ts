import type { Page } from "@playwright/test";

/**
 * Selects characters from the start of an unmarked text body.
 *
 * @param page the Playwright page
 * @param content the rendered text content
 * @param length the number of characters to select
 */
export async function selectTextRange(
  page: Page,
  content: string,
  length: number,
): Promise<void> {
  const text = page.getByText(content, { exact: true }).first();

  await text.evaluate((element, count) => {
    const node = element.firstChild;
    if (!node) throw new Error("Missing text node");

    const range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, count);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  }, length);
}
