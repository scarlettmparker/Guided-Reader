import { Component, createEffect, createSignal, onMount, Show } from "solid-js";
import { render_annotated_text } from "~/utils/render/renderutils";
import { SelectedText, Position, Annotation, VTTEntry } from "~/utils/types";
import { get_text_data } from "~/utils/textutils";

import AudioDisplay from '../AudioDisplay';
import Toolbar from "../Toolbar";
import TextDisplayProps from "./textdisplayprops";
import styles from "./textdisplay.module.css";

const SELECTION_LIMIT = 90;

/**
 * Validate the selection to ensure it is not empty and not too long.
 * 
 * @param selection Selection to validate.
 * @returns True if the selection is valid, false otherwise.
 */
function validate_selection(selection: Selection | null): boolean {
  if (!selection) return false;
  const trimmed = selection.toString().trim();
  return trimmed.length > 0 && trimmed.length <= SELECTION_LIMIT;
}

/**
 * Send a selected text event to the document. This is used for the WordReference
 * menu to quickly look up words after selecting them.
 * 
 * @param selection Selection to send the event for.
 */
function send_selected_text_event(selection: Selection): void {
  const closest_div = selection.anchorNode?.parentElement?.closest('div');
  const closest_div_id = closest_div ? closest_div.id : null;

  if (closest_div_id !== "text_content") {
    return;
  }

  if (selection.toString().length > 0) {
    // ... send the selected text event to the document ...
    const selected_text_event = new CustomEvent('selected-text', {
      detail: selection.toString(),
      bubbles: true
    });
    document.dispatchEvent(selected_text_event);
  }
}

/**
 * Check if the selection is intersecting with any existing annotations.
 * 
 * @param range Range of the selection.
 * @returns True if the selection is intersecting with an annotation, false otherwise.
 */
function is_intersecting_annotation(range: Range): boolean {
  const start_element = range.startContainer.parentElement;
  const end_element = range.endContainer.parentElement;
  const is_annotated = (el: HTMLElement | null) => !!el?.closest('span[id^="annotated-text"]');

  return Array.from(document.querySelectorAll('span[id^="annotated-text"]'))
    .some(span => range.intersectsNode(span as Node))
    || !!start_element?.closest('#annotation')
    || is_annotated(start_element)
    || is_annotated(end_element);
}

/**
 * Calculate the position of the annotate button based on the selection.
 * 
 * @param range Range of the selection.
 * @returns Position of the annotate button.
 */
function calculate_position(range: Range): Position {
  const { left, top, width } = range.getBoundingClientRect();

  return {
    x: left + (width / 2) + window.scrollX,
    y: top + window.scrollY - 30
  };
}

/**
 * Get selected text indices based on the selection.
 * 
 * @param start_div Starting div element.
 * @param start_container Starting container of the selection.
 * @param start_offset Starting offset of the selection.
 * @returns Character index of the selection.
 */
function get_selection_indices(
  start_div: Element, range: Range, selection: Selection, text_id: number
): SelectedText | null {
  const char_index = get_character_index(start_div, range.startContainer, range.startOffset);
  return {
    text_id: text_id,
    text: selection.toString(),
    start: char_index,
    end: char_index + selection.toString().length
  };
}

/**
 * Adjust the selection range to remove trailing spaces.
 * 
 * @param selection The current selection.
 * @param original_range The original range of the selection.
 * @param original_selection The original selected text.
 */
function adjust_selection_range(selection: Selection, original_range: Range, original_selection: string): void {
  const trimmed_selection = original_selection.trimEnd();
  if (trimmed_selection !== original_selection) {
    // ... remove trailing spaces from the selection ...
    const trailing_spaces = original_selection.length - trimmed_selection.length;
    const range = document.createRange();

    range.setStart(original_range.startContainer, original_range.startOffset);
    range.setEnd(original_range.endContainer, original_range.endOffset - trailing_spaces);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

/**
 * Handle the text selection event. This is used to determine the selected text and its position,
 * to display the annotate button. This function also checks if the selection is valid and not intersecting
 * with any existing annotations. If the selection is valid, the selected text is stored in local storage.
 * The local storage is used for quickly pre-loading wordreference definitions of the selected word.
 * 
 * @param text Text content to check selection against.
 * @param text_id ID of the text content.
 * @param set_selected_text Function to set the selected text.
 * @returns Position of the selected text.
 */
function handle_text_selection(
  text: string, text_id: number, set_selected_text: (value: SelectedText | null) => void
): Position | null {
  let selection = window.getSelection();

  if (!validate_selection(selection)) {
    set_selected_text(null);
    return null;
  }

  // ... get the range and selection to adjust for trailing spaces ...
  const original_range = selection!.getRangeAt(0);
  const original_selection = selection!.toString();
  adjust_selection_range(selection!, original_range, original_selection);
  send_selected_text_event(selection!);

  if (selection!.toString() === text) {
    set_selected_text(null);
    return null;
  }

  const range = selection!.getRangeAt(0);

  if (is_intersecting_annotation(range)) {
    set_selected_text(null);
    return null;
  }

  const start_element = range.startContainer.parentElement;
  const end_element = range.endContainer.parentElement;
  const start_div = start_element?.closest('div');

  if (start_div && start_div === end_element?.closest('div') && start_div.id == "text_content") {
    const indices = get_selection_indices(start_div, range, selection!, text_id);
    set_selected_text(indices);
    return calculate_position(range);
  }

  set_selected_text(null);
  return null;
}

/**
 * Get the character index of the selection.
 * This is used to determine the start and end indices of the selected text for submitting annotations.
 * 
 * @param start_div Starting div element.
 * @param start_container Starting container of the selection.
 * @param start_offset Starting offset of the selection.
 * @returns Character index of the selection.
 */
function get_character_index(start_div: Element, start_container: Node, start_offset: number): number {
  let char_index = 0;

  const traverse_nodes = (node: Node): boolean => {
    if (node === start_container) {
      char_index += start_offset;
      return true;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      char_index += node.textContent!.length;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      for (let i = 0; i < node.childNodes.length; i++) {
        if (traverse_nodes(node.childNodes[i])) {
          return true;
        }
      }
    }
    return false;
  }

  traverse_nodes(start_div);
  return char_index;
}

/**
 * Check if the selection is within the text content.
 * Used to determine if the annotate button should be displayed.
 * 
 * @param selection Selection to check.
 * @returns True if the selection is within the text content, false otherwise.
 */
function selection_in_text_content(selection: Selection): boolean {
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);

    const start_element = range!.startContainer.parentElement;
    const start_div = start_element?.closest('div');
    const parent_div = start_div?.parentElement;

    if (parent_div && parent_div.id == "text_content") {
      return true;
    }
  }
  return false;
}

/**
 * Process the grandparent node to highlight the text content.
 * This is needed due to the structure of text annotations, where the text content is split into
 * multiple nodes. This function will find all annotated text elements and restore them to their
 * original state after highlighting the text content.
 * 
 * @param grandparent Grandparent node to process.
 * @param highlight_text Text to highlight.
 */
function process_grandparent_node(grandparent: HTMLElement, highlight_text: string) {
  // ... find all annotated text elements ...
  const annotated_elements = Array.from(grandparent.querySelectorAll('[id^="annotated-text-"]'));
  const annotated_text_map = new Map(
    annotated_elements.map(el => [el.textContent || '', el.outerHTML])
  );
  const text_content = grandparent.textContent || '';

  // ... check if the text content contains the highlight text ...
  if (text_content.includes(highlight_text) && highlight_text) {
    const regex = new RegExp(`(\\s*${highlight_text}\\s*)`, 'gi');
    let highlighted_text = text_content;
    highlighted_text = highlighted_text.replace(regex, `<span class="${styles.highlighted_text}">$1</span>`);

    // ... restore annotated text ...
    annotated_text_map.forEach((html, text) => {
      highlighted_text = highlighted_text.replace(text, html);
    });
    grandparent.innerHTML = highlighted_text;
    return;
  }

  // ... remove no longer needed highlights ...
  if (!text_content.includes(highlight_text)) {
    const highlight_spans = grandparent.querySelectorAll(`.${styles.highlighted_text}`);
    highlight_spans.forEach(span => {
      if (!span.querySelector('[id^="annotated-text-"]')) {
        span.replaceWith(span.textContent || '');
      }
    });
  }
}

/**
 * Highlight the text content based on the current VTT entry.
 * This will highlight the text content based on the current time of the audio,
 * recursively checking the text content of nodes for matches with the VTT entry text.
 * 
 * @param node Node to check for text content.
 * @param highlight_text Text to highlight.
 * @param current_entry Current VTT entry to highlight.
 */
function highlight_text_node(node: Node, highlight_text: string, current_entry: VTTEntry) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text_content = node.textContent || '';

    // ... check for annotated text ...
    const parent = (node as ChildNode).parentElement;
    if (parent?.id?.startsWith('annotated-text-')) {
      const grandparent = parent.parentElement;
      if (grandparent) {
        process_grandparent_node(grandparent, highlight_text);
      }
    }

    // ... remove no longer needed highlights ...
    if (!text_content.includes(highlight_text)) {
      const parent_element = (node as ChildNode).parentElement;
      if (parent_element?.classList.contains(styles.highlighted_text)) {
        parent_element.classList.remove(styles.highlighted_text);
      }
    }

    // ... check if the text content contains the highlight text ...
    if (text_content.includes(highlight_text) && highlight_text) {
      const parent_element = (node as ChildNode).parentElement;
      if (parent_element?.classList.contains(styles.highlighted_text)) {
        return;
      }

      const regex = new RegExp(`(\\s*${highlight_text}\\s*)`, 'gi');
      const new_text_content: string = text_content.replace(regex, (match: string) => {
        return `<span class="${styles.highlighted_text}">${match}</span>`;
      });

      const span = document.createElement('span');
      span.innerHTML = new_text_content;
      (node as ChildNode).replaceWith(...span.childNodes);
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    // ... recursively process child nodes ...
    node.childNodes.forEach(child => highlight_text_node(child, highlight_text, current_entry));
  }
}
/**
 * Text display component for the Guided Reader.
 * This component displays the text content and any annotations that have been made on the text.
 * 
 * @param current_text Current text to display.
 * @param loading_texts Set of texts that are currently loading.
 * @param error Error message to display.
 * @param annotations_map Map of annotations for each text.
 * @param get_current_text Function to get the current text.
 * @returns JSX Element for the text display.
 */
const TextDisplay: Component<TextDisplayProps> = (props) => {
  const empty_text_data = { text_id: -1, text: "", start: -1, end: -1 };
  let ref!: HTMLDivElement;

  const [selected_text, set_selected_text] = createSignal<SelectedText | null>(null);
  const [last_selected_text, set_last_selected_text] = createSignal<SelectedText | null>(empty_text_data);
  const [button_position, set_button_position] = createSignal<Position | null>(null);

  // ... vtt stuff ...
  const [current_time, set_current_time] = createSignal(0);
  const [playing, set_playing] = createSignal(false);
  const [vtt_entries, set_vtt_entries] = createSignal<VTTEntry[]>([]);

  const clear = () => {
    set_last_selected_text(empty_text_data);
    set_selected_text(null);
    set_button_position(null);
  }

  const handle_mouse_up = (event: MouseEvent | TouchEvent) => {
    // ... ensure the annotate button can still be clicked ...
    if ((event.target as HTMLElement).id === "annotate_button") {
      return;
    }

    // ... clear the selection if it is not within the text content ...
    const selection = window.getSelection();
    if (!selection_in_text_content(selection!)) {
      set_selected_text(null);
      set_button_position(null);
    }

    if (selection && selection.toString().length > 0) {
      const new_position = handle_text_selection(
        props.get_current_text()?.text!, props.current_text(), set_selected_text
      )

      if (selected_text()) {
        const current = selected_text()!;
        const last = last_selected_text()!;

        const same_selection = current.text === last.text
          && current.start === last.start
          && current.end == last.end;

        // ... if the selection is the same as the last selection, clear the selection ...
        if (!same_selection) {
          set_button_position(new_position);
          set_last_selected_text(selected_text());
        } else {
          clear();
        }
      }
    } else {
      clear();
    }
  };

  // ... reload annotations for when every annotation entry is deleted ...
  const reload_annotations = async () => {
    const current_text = props.get_current_text();
    const new_annotations = await get_text_data(current_text!.id, current_text!.language, "annotations") as Annotation[];
    props.set_annotations_map(new Map(props.annotations_map().set(current_text!.id, new_annotations)));
  }


  createEffect(() => {
    // ... dispatch the selected text event ...
    const event = new CustomEvent('select-text', {
      bubbles: true,
      detail: { text: selected_text(), position: button_position() }
    });
    document.dispatchEvent(event);
  })

  createEffect(() => {
    // ... check for updates in the VTT entries & playback status ...
    // ... use this to highlight the text content based on the current time ...
    const current_entry = vtt_entries().find(entry => current_time() >= entry.start && current_time() <= entry.end);
    const highlight_text = current_entry ? current_entry.text.trim() : '';
    const text_content = document.getElementById('text_content');

    if (playing() && text_content && current_entry) {
      highlight_text_node(text_content!, highlight_text, current_entry!);
    }
  })

  onMount(() => {
    window.addEventListener('mouseup', handle_mouse_up);
    window.addEventListener('touchend', handle_mouse_up);
    window.addEventListener('create-annotation', reload_annotations);
    window.addEventListener('delete-no-annotations', reload_annotations);
    return () => {
      window.removeEventListener('mouseup', handle_mouse_up);
      window.removeEventListener('touchend', handle_mouse_up);
      window.removeEventListener('create-annotation', reload_annotations);
      window.removeEventListener('delete-no-annotations', reload_annotations);
    }
  })

  return (
    <div ref={ref} class={styles.text_display}>
      <Toolbar text_ref={ref} />
      <Show when={props.error()}>
        <div class={styles.error}>{props.error()}</div>
      </Show>
      <Show when={props.current_text() !== -1}
        fallback={<div>Select a text to begin</div>}>
        <Show when={!props.loading_texts().has(props.current_text())}
          fallback={<div>Loading...</div>}>
          <div id="text_content" class={styles.text_content}
            style={props.get_current_text()?.audio ? { "padding-bottom": "4rem" } : undefined} innerHTML={
              render_annotated_text(props.get_current_text()?.text!, props.annotations_map().get(props.current_text())
                || [])
            } />
        </Show>
      </Show>
      {props.get_current_text()?.audio && (
        <AudioDisplay audio={props.get_current_text()?.audio!} set_vtt_entries={set_vtt_entries}
          set_current_time={set_current_time} set_playing={set_playing} />
      )}
    </div>
  );
}

export default TextDisplay;