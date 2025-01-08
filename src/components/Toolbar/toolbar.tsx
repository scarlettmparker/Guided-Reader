import { Component, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import styles from './toolbar.module.css';

const Toolbar: Component<ToolbarProps> = (props) => {
  const [current_menu, set_current_menu] = createSignal(-1);

  // ... increase or decrease the font size of the text ...
  const decrease_font_size = () => {
    if (props.text_ref && !props.text_ref.closest(`.${styles.toolbar}`)) {
      const current_font_size = parseFloat(window.getComputedStyle(props.text_ref).fontSize);
      current_font_size > 16 && (props.text_ref.style.fontSize = `${current_font_size - 1}px`);
    }
  }

  const increase_font_size = () => {
    if (props.text_ref && !props.text_ref.closest(`.${styles.toolbar}`)) {
      const current_font_size = parseFloat(window.getComputedStyle(props.text_ref).fontSize);
      current_font_size < 28 && (props.text_ref.style.fontSize = `${current_font_size + 1}px`);
    }
  }

  const change_menu = (menu: number) => {
    if (current_menu() == menu) {
      set_current_menu(-1);
    } else {
      set_current_menu(menu);
    }
  }

  const close_menus = () => {
    set_current_menu(-1);
  }

  // ... allow user to close menus by clicking outside of them ...
  const handle_click_outside = (event: MouseEvent) => {

    const target = event.target as HTMLElement;
    const selection = window.getSelection();
    const has_text_selection = selection && selection.toString().length > 0;
    const text_content_element = document.getElementById("text_content");

    // ... don't close menu if user is trying to select text for wordreference menu ...
    const is_text_node_click = text_content_element?.contains(target)
      && target.nodeType === Node.TEXT_NODE ||
      (target.childNodes.length === 1 && target.firstChild?.nodeType === Node.TEXT_NODE);
    const is_text_selection = text_content_element?.contains(selection!.anchorNode) && has_text_selection;

    if (!target.closest("#toolbar_menu") && !is_text_selection && !is_text_node_click) {
      close_menus();
    }
  }

  const handle_keydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      close_menus();
    }
  }

  onMount(() => {
    document.addEventListener("mousedown", handle_click_outside);
    document.addEventListener("keydown", handle_keydown);

    return () => {
      document.removeEventListener("mousedown", handle_click_outside);
      document.removeEventListener("keydown", handle_keydown);
    }
  });

  return (
    <div class={styles.toolbar}>
      <div class={styles.text_size_menu} id="toolbar_menu">
        <button class={styles.toolbar_button} id="text_size_button" onclick={() => change_menu(1)}>
          T
        </button>
        {current_menu() == 1 && (
          <div class={styles.text_size_dropdown}>
            <button class={styles.toolbar_button} onclick={decrease_font_size}>-</button>
            <button class={styles.toolbar_button} onclick={increase_font_size}>+</button>
          </div>
        )}
      </div>
      <div class={styles.wordreference_menu} id="toolbar_menu">
        <button class={styles.toolbar_button} onclick={() => change_menu(2)}>
          W
        </button>
        {current_menu() == 2 && (
          <WordReferenceModal />
        )}
      </div>
    </div>
  );
}

const WordReferenceModal: Component = () => {
  const [search_value, set_search_value] = createSignal("");

  const update_search_value = (e: CustomEvent) => {
    set_search_value(e.detail);
  }

  onMount(() => {
    // ... used if user closes and reopens the modal ...
    const saved_search = localStorage.getItem("wordreference_search");
    saved_search && set_search_value(saved_search);

    document.addEventListener("selected-text", update_search_value as EventListener);
    return () => {
      document.removeEventListener("selected-text", update_search_value as EventListener);
    }
  })

  createEffect(() => {
    localStorage.setItem("wordreference_search", search_value());
  })

  return (
    <div class={styles.wordreference_modal}>
      <input type="text" class={styles.wordreference_input} value={search_value()} placeholder="Search a word..."
        oninput={(event) => set_search_value((event.target as HTMLInputElement).value)} />
    </div>
  );
}

export default Toolbar;