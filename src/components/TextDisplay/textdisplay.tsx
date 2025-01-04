import { Component, createEffect, createSignal, onMount, Show } from "solid-js";
import { render_annotated_text } from "~/utils/render/renderutils";
import { SelectedText, Position, Annotation } from "~/utils/types";
import TextDisplayProps from "./textdisplayprops";
import styles from "./textdisplay.module.css";
import { get_text_data } from "~/utils/textutils";

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
 * Save the selected text to local storage.
 * 
 * @param selection Selection to save.
 */
function save_to_local_storage(selection: Selection): void {
  if (selection.toString().length > 0) {
    localStorage.setItem('last_selected_text', selection.toString().trim());
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
    x: left + (width / 2) + window.scrollX - 46,
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

  save_to_local_storage(selection!);

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

  const [selected_text, set_selected_text] = createSignal<SelectedText | null>(null);
  const [last_selected_text, set_last_selected_text] = createSignal<SelectedText | null>(empty_text_data);
  const [button_position, set_button_position] = createSignal<Position | null>(null);

  const handle_mouse_up = () => {
    const selection = window.getSelection();
    if (!selection_in_text_content(selection!)) {
      set_selected_text(null);
      set_button_position(null);
    }

    if (selection && selection.toString().length > 0 && selection.toString() !== last_selected_text()!.text) {
      set_button_position(handle_text_selection(
        props.get_current_text()?.text!, props.current_text(), set_selected_text
      ));

      // ... user went over selection limit ... 
      if (selected_text()!.text!.length > 0) {
        set_last_selected_text(selected_text());
      }
    } else if (selected_text() !== last_selected_text() || selection!.toString().length === 0) {
      set_last_selected_text(empty_text_data);
      set_selected_text(null);
      set_button_position(null);
    }
  };

  // ... reload annotations for when every annotation entry is deleted ...
  const reload_annotations = async () => {
    const current_text = props.get_current_text();
    const new_annotations = await get_text_data(current_text!.id, current_text!.language, "annotations") as Annotation[];
    props.set_annotations_map(new Map(props.annotations_map().set(current_text!.id, new_annotations)));
  }

  onMount(() => {
    window.addEventListener('mouseup', handle_mouse_up);
    window.addEventListener('create-annotation', reload_annotations);
    window.addEventListener('delete-no-annotations', reload_annotations);
    return () => {
      window.removeEventListener('mouseup', handle_mouse_up);
      window.removeEventListener('create-annotation', reload_annotations);
      window.removeEventListener('delete-no-annotations', reload_annotations);
    }
  })

  createEffect(() => {
    // ... dispatch the selected text event ...
    const event = new CustomEvent('select-text', {
      bubbles: true,
      detail: { text: selected_text(), position: button_position() }
    });
    document.dispatchEvent(event);
  })

  return (
    <div class={styles.text_display}>
      <Show when={props.error()}>
        <div class={styles.error}>{props.error()}</div>
      </Show>
      <Show when={props.current_text() !== -1}
        fallback={<div>Select a text to begin</div>}>
        <Show when={!props.loading_texts().has(props.current_text())}
          fallback={<div>Loading...</div>}>
          <>
            <div id="text_content" class={styles.text_content} innerHTML={
              render_annotated_text(props.get_current_text()?.text!,
                props.annotations_map().get(props.current_text()) || [])
            } />
          </>
        </Show>
      </Show>
    </div>
  );
}

export default TextDisplay;