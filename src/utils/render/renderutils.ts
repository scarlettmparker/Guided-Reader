import styles from "./renderutils.module.css";
import { Annotation } from "~/types";

/**
 * Helper function for rendering HTML content.
 * Sanitizes text by removing HTML tags and replacing non-breaking spaces with regular spaces.
 * 
 * @param raw_text The raw text to sanitize.
 * @param trim Whether to trim the text after sanitizing.
 * @returns The sanitized text.
 */
function sanitize_text(raw_text: string, trim: boolean = true): string {
  let sanitized_text = raw_text
    //.replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/\u00A0/g, ' ') // replace non-breaking spaces with regular spaces
    .replace(/\s+/g, ' ')    // replace all whitespace characters with a single space
    .trim();

  return trim ? sanitized_text.trim() : sanitized_text;
}

/**
 * Filters out overlapping annotations.
 * 
 * @param annotations Annotations to filter.
 * @param annotation_map Map of annotations.
 * @returns Filtered annotations.
 */
function filter_annotations(annotations: Annotation[], annotation_map: Record<string, Annotation>): Annotation[] {
  annotations.forEach(annotation => {
    const key = `${annotation.start}-${annotation.end}`;
    const current = annotation_map[key];

    if (!current) {
      annotation_map[key] = annotation;
    }
  });

  return Object.values(annotation_map).sort((a, b) => a.start - b.start);
}

/**
 * Processes a text node and applies annotations to create HTML spans with appropriate styling.
 * Splits the text into annotated and unannotated segments, wrapping each in span elements
 * with unique IDs and classes for styling.
 * 
 * @param last_index - The current position in the overall text being processed
 * @param parts - Array to collect HTML string fragments during processing
 * @param annotations - Array of Annotation objects defining ranges and styles to apply
 * @param text_node - The text content to process and annotate
 * @param start_offset - Starting character offset of this text node in the overall text
 * @returns The ending position (last_index + length of processed text)
 * 
 * @example
 * const parts = [];
 * const annotations = [{start: 5, end: 10}];
 * process_text_node(0, parts, annotations, "Hello world", 0);
 * // ... parts will contain: ["<span id="plain-text-0">Hello</span>", ...
 * // ...                    "<span id="annotated-text-0"> worl</span>", ...
 * // ...                    "<span id="plain-text-1">d</span>"] ...
 */
function process_text_node(
  last_index: number, parts: string[], annotations: Annotation[], text_node: string, start_offset: number
) {
  let current_offset = start_offset;
  let last_annotated_index = 0, annotation_counter = 0, plain_text_counter = 0;

  annotations.forEach(annotation => {
    // ... check if the annotation overlaps with the current text node ...
    if (current_offset < annotation.end && current_offset + text_node.length > annotation.start) {
      const overlap_start = Math.max(annotation.start, current_offset);
      const overlap_end = Math.min(annotation.end, current_offset + text_node.length);
      const unannotated_text = text_node.slice(last_annotated_index, overlap_start - current_offset);

      if (unannotated_text) {
        parts.push(`<span id="plain-text-${plain_text_counter++}">${unannotated_text}</span>`);
      }

      const annotated_text = text_node.slice(overlap_start - current_offset, overlap_end - current_offset);
      if (annotated_text) {
        parts.push(`<span id="annotated-text-${annotation_counter++}" class="${styles.annotated_text}">${annotated_text}</span>`);
      }

      last_annotated_index = overlap_end - current_offset;
    }
  });

  // ... add the remaining text as plain text ...
  if (last_annotated_index < text_node.length) {
    const remaining_text = text_node.slice(last_annotated_index);
    if (remaining_text) {
      parts.push(`<span id="plain-text-${plain_text_counter++}">${remaining_text}</span>`);
    }
  }
  return last_index + text_node.length;
}

/**
 * Helper function to get the attributes of an HTML element as a string.
 * 
 * @param element HTML element to get the attributes of.
 * @returns Attributes of the HTML element as a string.
 */
function get_attributes(element: HTMLElement): string {
  return Array.from(element.attributes).reduce((attrs, attr) => `${attrs} ${attr.name}="${attr.value}"`, '');
}

/**
 * Recursively processes DOM nodes to build an annotated HTML representation.
 * Handles both text nodes and element nodes, preserving the original HTML structure
 * while applying annotations where specified.
 * 
 * @param last_index - Current position in the overall text being processed
 * @param parts - Array to collect HTML string fragments during processing
 * @param annotations - Array of Annotation objects defining ranges and styles to apply
 * @param node - DOM Node to process (either text node or element node)
 * @returns Updated last_index after processing the node and its children
 */
function process_node(last_index: number, parts: string[], annotations: Annotation[], node: Node): number {
  if (node.nodeType === Node.TEXT_NODE) {
    const text_node = node.textContent || '';
    return process_text_node(last_index, parts, annotations, text_node, last_index);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    parts.push(`<${element.tagName.toLowerCase()}${get_attributes(element)}>`);

    let new_last_index = last_index;
    node.childNodes.forEach(child => {
      new_last_index = process_node(new_last_index, parts, annotations, child);
    });

    parts.push(`</${element.tagName.toLowerCase()}>`);
    return new_last_index;
  }
  return last_index;
}

/**
 * Renders annotated text with HTML markup.
 * This function is used to render text with annotations, where each annotation is a span element with a specific class.
 * It is also used to render highlights of the current VTT cue.
 * 
 * @param text Text to render.
 * @param annotations Annotations to apply to the text.
 * @returns Rendered text with annotations.
 */
export function render_annotated_text(text: string, annotations: Annotation[]) {
  const annotation_map: Record<string, Annotation> = {};
  const parts: string[] = [];
  const last_index = 0;

  text = sanitize_text(text, false);

  const filtered_annotations = filter_annotations(annotations, annotation_map);
  const temp_div = document.createElement('div');
  temp_div.innerHTML = text;

  process_node(last_index, parts, filtered_annotations, temp_div);
  return parts.join('').replace(/<br\s*\/?>/g, '');
}