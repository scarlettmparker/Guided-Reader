import { Component, Show } from "solid-js";
import { render_annotated_text } from "~/utils/render/renderutils";
import TextDisplayProps from "./textdisplayprops";
import styles from "./textdisplay.module.css";

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
  return (
    <div class={styles.text_display}>
      <Show when={props.error()}>
        <div class={styles.error}>{props.error()}</div>
      </Show>
      <Show when={props.current_text() !== -1}
        fallback={<div>Select a text to begin</div>}>
        <Show when={!props.loading_texts().has(props.current_text())}
          fallback={<div>Loading...</div>}>
          <div class={styles.text_content} innerHTML={
            render_annotated_text(props.get_current_text()?.text!,
              props.annotations_map().get(props.current_text()) || [])
          } />
        </Show>
      </Show>
    </div >
  );
}

export default TextDisplay;