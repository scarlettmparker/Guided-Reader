/**
 * Utilities for wrapping character ranges within a container's rendered text
 * content in elements, used to highlight annotation ranges over markdown output.
 */

type TextNodeRange = {
  node: Text;
  start: number;
  length: number;
};

/**
 * Collects every text node under the container with its global character offset
 * and length, in document order.
 *
 * @param container the element whose text content the offsets are relative to
 * @returns the text nodes with their global offset ranges
 */
function collectTextNodes(container: HTMLElement): TextNodeRange[] {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const nodes: TextNodeRange[] = [];
  let cumulative = 0;
  let current = walker.nextNode();
  while (current) {
    const text = current as Text;
    nodes.push({ node: text, start: cumulative, length: text.length });
    cumulative += text.length;
    current = walker.nextNode();
  }
  return nodes;
}

/**
 * Wraps a character range [start, end) within the container's text content in
 * elements produced by the factory. Each text-node portion in the range is
 * wrapped individually, so ranges that cross element boundaries stay valid HTML
 * (a multi-paragraph annotation yields one element per text node).
 *
 * @param container the element whose text content the offsets are relative to
 * @param start the inclusive start character offset
 * @param end the exclusive end character offset
 * @param factory returns a fresh element to wrap each portion in
 * @returns the wrapped elements
 */
export function wrapCharacterRange(
  container: HTMLElement,
  start: number,
  end: number,
  factory: () => HTMLElement,
): HTMLElement[] {
  if (start >= end) return [];

  const wrapped: HTMLElement[] = [];
  for (const { node, start: nodeStart, length } of collectTextNodes(
    container,
  )) {
    const nodeEnd = nodeStart + length;
    if (nodeEnd <= start || nodeStart >= end || length === 0) continue;

    const localStart = Math.max(0, start - nodeStart);
    const localEnd = Math.min(length, end - nodeStart);

    // Split off the unwanted tail, then the head, leaving the middle portion.
    if (localEnd < length) {
      node.splitText(localEnd);
    }
    const middle = localStart > 0 ? node.splitText(localStart) : node;

    const mark = factory();
    middle.parentNode?.insertBefore(mark, middle);
    mark.appendChild(middle);
    wrapped.push(mark);
  }

  return wrapped;
}

/**
 * Removes every element produced by {@link wrapCharacterRange} marked with the
 * given data attribute, replacing each with its text content and normalising
 * adjacent text nodes so the container is ready to be re-wrapped.
 *
 * @param container the element previously wrapped
 * @param attr the data attribute used to tag wrapped elements
 */
export function unwrapCharacterRange(
  container: HTMLElement,
  attr: string,
): void {
  container.querySelectorAll(`[${attr}]`).forEach((mark) => {
    const parent = mark.parentNode;
    if (!parent) return;
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark);
    }
    parent.removeChild(mark);
  });
  container.normalize();
}
