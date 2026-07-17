/**
 * Utilities for mapping a browser text selection to character offsets within a container.
 */

type SelectionOffsets = {
  /**
   * Trimmed start character offset.
   */
  start: number;
  /**
   * Trimmed end character offset.
   */
  end: number;
  /**
   * The trimmed selected text.
   */
  text: string;
};

/**
 * Checks whether a node is contained within (or is) the given container.
 */
function isWithin(node: Node, container: HTMLElement): boolean {
  return container === node || container.contains(node);
}

/**
 * Returns the character offset of a DOM point relative to the container's text
 * content, measured as the text length of a range from the container's start to
 * the point. Handles element-node boundaries (e.g. a paragraph edge) that a
 * text-node walk would miss.
 */
function pointOffset(
  container: HTMLElement,
  node: Node,
  offset: number,
): number {
  const range = document.createRange();
  range.selectNodeContents(container);
  range.setEnd(node, offset);
  return range.toString().length;
}

/**
 * Gets the character offsets of the current browser selection within a container,
 * with leading and trailing whitespace trimmed.
 *
 * @param container the element whose text content the offsets are relative to
 * @returns the trimmed offsets and text, or null if there is no valid selection
 */
export function getSelectionOffsets(
  container: HTMLElement,
): SelectionOffsets | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null;
  }

  const range = selection.getRangeAt(0);
  if (
    !isWithin(range.startContainer, container) ||
    !isWithin(range.endContainer, container)
  ) {
    return null;
  }

  const start = pointOffset(container, range.startContainer, range.startOffset);
  const end = pointOffset(container, range.endContainer, range.endOffset);
  const selectedText = range.toString();

  const lead = selectedText.length - selectedText.replace(/^\s+/, "").length;
  const trail = selectedText.length - selectedText.replace(/\s+$/, "").length;
  const trimmedStart = start + lead;
  const trimmedEnd = end - trail;

  if (trimmedStart >= trimmedEnd) {
    return null;
  }
  return { start: trimmedStart, end: trimmedEnd, text: selectedText.trim() };
}

/**
 * Checks whether a character range [start, end) overlaps any of the given
 * annotation ranges, using half-open interval semantics (matching the
 * backend's overlap rule).
 */
export function overlapsExisting(
  start: number,
  end: number,
  ranges: Array<{ startOffset: number; endOffset: number }>,
): boolean {
  return ranges.some((r) => start < r.endOffset && end > r.startOffset);
}

/**
 * Checks whether a character range exactly matches one of the given ranges.
 * Exact matches are allowed (co-annotation); only partial overlaps are blocked.
 */
export function equalsExisting(
  start: number,
  end: number,
  ranges: Array<{ startOffset: number; endOffset: number }>,
): boolean {
  return ranges.some((r) => start === r.startOffset && end === r.endOffset);
}
