import { Component, For, onCleanup, onMount } from "solid-js";
import { TextTitle } from "~/utils/types";
import TextListProps from "./textlistprops";
import styles from "./textlist.module.css";

/**
 * Component for displaying a list of texts. Implements lazy
 * loading to fetch more texts as the user scrolls.
 * 
 * @param items List of texts to display.
 * @param children Individual text item component.
 * @returns JSX Element for the text list.
 */
const TextList: Component<TextListProps<TextTitle>> = (props) => {
  let observer_target!: HTMLDivElement;

  onMount(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        props.set_page(props.page() + 1);
      }
    },
      { threshold: 1 }
    );
    if (observer_target) {
      observer.observe(observer_target);
    }
    onCleanup(() => {
      observer.disconnect();
    });
  })

  return (
    <div class={styles.text_list} id="text_list">
      <For each={props.items()}>
        {props.children}
      </For>
      <div ref={observer_target} class={styles.loading_buffer} />
    </div>
  );
};

export default TextList;