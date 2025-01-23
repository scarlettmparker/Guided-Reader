import { Component, createEffect, createSignal, JSX, onMount } from "solid-js";
import { defineWord, WRTranslation } from 'wordreference';
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

  // ... helper to toggle menus (otherwise clicking on own open menu doesn't close it) ...
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
        <ButtonWithAltText alt_text={"Font Size"} class={styles.toolbar_button} onclick={() => change_menu(1)}>
          T
        </ButtonWithAltText>
        {current_menu() == 1 && (
          <div class={styles.text_size_dropdown}>
            <button class={styles.toolbar_button} onclick={decrease_font_size}>-</button>
            <button class={styles.toolbar_button} onclick={increase_font_size}>+</button>
          </div>
        )}
      </div>
      <div class={styles.wordreference_menu} id="toolbar_menu">
        <ButtonWithAltText alt_text={"Word Reference"} class={styles.toolbar_button} onclick={() => change_menu(2)}>
          W
        </ButtonWithAltText>
        {current_menu() == 2 && (
          <WordReferenceModal />
        )}
      </div>
    </div>
  );
}

interface ButtonWithAltTextProps {
  alt_text: string;
  class: string;
  onclick: () => void;
  children?: JSX.Element;
}

const ButtonWithAltText: Component<ButtonWithAltTextProps> = (props) => {
  const [display_tooltip, set_display_tooltip] = createSignal(false);

  return (
    <>
      {display_tooltip() && <span class={styles.tooltip}>{props.alt_text}</span>}
      <button class={props.class} onclick={props.onclick} title={props.alt_text}
        onmouseover={() => set_display_tooltip(true)} onmouseleave={() => set_display_tooltip(false)}>
        {props.children}
      </button>
    </>
  )
}

function debounce(func: () => Promise<void>, wait: number) {
  let timeout: NodeJS.Timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func();
    }, wait);
  };
}

/**
 * WordReferenceModal component.
 * This displays the word reference modal and handles the logic for fetching definitions.
 * Uses wordreference npm package to fetch definitions, so everything is handled on the front-end.
 */
const WordReferenceModal: Component = () => {
  const [search_value, set_search_value] = createSignal("");
  const [definition, set_definition] = createSignal<WRTranslation | null>(null);
  const [filtered_sections, set_filtered_sections] = createSignal<any[]>([]);
  const [first_non_empty_word, set_first_non_empty_word] = createSignal("");

  const DEBOUNCE_MS = 100;
  const DICTIONARY = "Greek-English";

  const get_word_reference_entry = async (word: string) => {
    const definition = await defineWord(word, DICTIONARY);

    // TODO: TYPE SECTION AT SOME POINT
    const filtered_sections = definition.sections.filter((section: any) => section.translations.length > 0);

    // ... find the first non-empty word in the definition ...
    for (const section of filtered_sections) {
      for (const translation of section.translations) {
        if (translation.word && translation.word.word) {
          set_first_non_empty_word(translation.word.word);
          break;
        }
      }
      if (first_non_empty_word()) {
        break;
      }
    }

    set_definition(definition);
    set_filtered_sections(filtered_sections);
  }

  // ... used to avoid spamming requests ...
  const debounced_get_word_reference_entry = debounce(async () => {
    const word = search_value();
    if (word) {
      await get_word_reference_entry(word);
    }
  }, DEBOUNCE_MS);

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
    const word = search_value();
    localStorage.setItem("wordreference_search", word);
    debounced_get_word_reference_entry();
  })

  return (
    <div class={styles.wordreference_modal} id="wordreference_modal">
      <input type="text" class={styles.wordreference_input} value={search_value()} placeholder="Search a word..."
        oninput={(event) => set_search_value((event.target as HTMLInputElement).value)} />
      {(definition() && definition()!.sections.length > 0) ? (
        <div class={styles.wordreference_answer}>
          <span class={styles.header_text}>{first_non_empty_word()}</span>
          {filtered_sections() &&
            filtered_sections().map((section: any, index: number) => (
              <>
                <span class={styles.section_title}>{section.title}</span>
                {section.translations && section.translations.map((translation: any) => (
                  <>
                    {translation.definition && (
                      <span class={`${styles.body_text} ${styles.header_divider}`}>
                        <span class={styles.definition_text}>Definition:</span> {translation.definition}
                      </span>
                    )}
                    {translation.meanings?.length > 0 && translation.meanings.map((meaning: any) => (
                      <span class={`${styles.body_text} ${styles.meanings_text}`}>
                        {JSON.stringify(meaning.word).replace(/\\n/g, ' ')}
                      </span>
                    ))}
                    {translation.examples?.length > 0 && translation.examples.map((example: any) => (
                      <>
                        {example.phrase && (
                          <span class={`${styles.body_text} ${styles.header_divider}`}>
                            <span class={styles.definition_text}>Phrase:</span> {example.phrase}
                          </span>
                        )}
                        {example.translations?.length > 0 && example.translations.map((exampleTranslation: any) => (
                          <span class={`${styles.body_text} ${styles.meanings_text}`}>
                            {JSON.stringify(exampleTranslation).replace(/\\n/g, ' ')}
                          </span>
                        ))}
                      </>
                    ))}
                  </>
                ))}
                {index < filtered_sections().length - 1 && <hr />}
              </>
            ))}
        </div>
      ) : (
        <div class={styles.wordreference_answer}>
          <span class={styles.body_text}>
            {search_value().length == 0 ? "Search or select a word to see its definition" : "No results found"}
          </span>
        </div>
      )}
    </div>
  );
}

export default Toolbar;
