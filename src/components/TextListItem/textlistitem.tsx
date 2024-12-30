import { Component } from "solid-js";
import TextListItemProps from "./textlistprops";
import styles from "./textlistitem.module.css";

/**
 * Component for displaying an individual text item.
 * 
 * @param text Text to display.
 * @param class Class to apply to the text item.
 * @param onclick Function to call when the text item is clicked.
 * @returns JSX Element for the text item.
 */
const TextListItem: Component<TextListItemProps> = (props) => {
  return (
    <div class={props.class!()} onclick={props.onclick} onmouseenter={props.onmouseenter}>
      <span class={styles.text_list_item_title}>{props.text.title}</span>
    </div>
  );
}

export default TextListItem;