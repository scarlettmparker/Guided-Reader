import { Title } from '@solidjs/meta';
import { Accessor, createEffect, createMemo, createSignal, For, JSX, onCleanup, onMount, Show, type Component } from 'solid-js';
import { ENV } from '~/const';
import styles from './index.module.css';
import { TextTitle, Text, Annotation } from '~/types';
import { render_annotated_text } from '~/utils/render/renderutils';

const Index: Component = () => {
  return (
    <>
      <Title>Guided Reader</Title>
      <Reader />
    </>
  );
};

const PAGE_SIZE = 335;
const SORT = 0;

/**
 * Fetches a list of text titles from the server given a page number, page size, and sort order.
 * SORT ORDERS: 0 - ASCENDING BY ID.
 * 
 * @param PAGE Page number to fetch.
 * @param PAGE_SIZE Number of items to fetch per page.
 * @param SORT Sort order for the fetched items.
 * @returns List of text titles.
 */
async function get_titles(
  PAGE: number, PAGE_SIZE: number, SORT: number, set_reached_end: (reached_end: boolean) => void
): Promise<TextTitle[]> {
  const response = await fetch(
    `http://${ENV.VITE_SERVER_HOST}:${ENV.VITE_SERVER_PORT}/titles?sort=${SORT}&page=${PAGE}&page_size=${PAGE_SIZE}`
  );

  const data = await response.json();
  if (data.status == 'ok') {
    return data.message;
  } else {
    if (data.message == 'No titles found') {
      set_reached_end(true);
    }
  }
  return [];
}

/**
 * Fetches a text from the server given a text ID and language.
 * This will return the text data itself, the text data + annotations, or just annotations.
 * Data types: "all", "annotations".
 * 
 * @param id Text ID to fetch.
 * @param language Language of the text to fetch.
 * @returns Text object.
 */
async function get_text(id: number, language: string, data_type: string): Promise<Text | Annotation[]> {
  const controller = new AbortController();
  const timeout_id = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(
      `http://${ENV.VITE_SERVER_HOST}:${ENV.VITE_SERVER_PORT}/text?text_id=${id}&language=${language}&type=${data_type}`,
      {
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data_type == "annotations") {
      return data.message;
    } else if (data.status === 'ok' && data.message?.[0]) {
      const result = data.message[0];
      return result;
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error(`Failed to fetch text ${id}:`, error);
    return { annotations: [], id: -1, text: '', language: '', text_object_id: -1 };
  } finally {
    clearTimeout(timeout_id);
  }
}

/**
 * Main component for the Guided Reader.
 * Contains the text list and the text display.
 * 
 * @returns JSX Element for the Guided Reader.
 */
const Reader: Component = () => {
  const [current_text, set_current_text] = createSignal(-1);

  // ... state for loading texts and annotations ...
  const [loading_texts, set_loading_texts] = createSignal<Set<number>>(new Set());
  const [loading_annotations, set_loading_annotations] = createSignal<Set<number>>(new Set());
  const [error, set_error] = createSignal<string>('');

  // .. state for text and text data (titles, texts, annotations) ...
  const [titles, set_titles] = createSignal<TextTitle[]>([]);
  const [texts, set_texts] = createSignal<Text[]>([]);
  const [annotations_map, set_annotations_map] = createSignal<Map<number, Annotation[]>>(new Map());

  const [page, set_page] = createSignal(0);
  const [reached_end, set_reached_end] = createSignal(false);

  onMount(() => {
    if (!reached_end()) {
      get_titles(page(), PAGE_SIZE, SORT, set_reached_end).then((new_titles) => {
        set_titles(prev => [...prev, ...new_titles]);
      });
    }
  });

  const existing_text = (id: number, language: string) => {
    return texts().find(text => text.text_object_id === id && text.language === language);
  };

  const get_current_text = createMemo(() => {
    return texts().find(text => text.text_object_id === current_text());
  });

  const annotate_text = (text: string, annotations: Annotation[]) => {
    return render_annotated_text(text, annotations);
  };

  const load_text_with_annotations = async (id: number, language: string) => {
    await load_text(id, language);
    if (!annotations_map().has(id)) {
      await load_annotations(id, language);
    }
  }

  // ... loads a text to the list of texts to display ...
  const load_text = async (id: number, language: string) => {
    if (loading_texts().has(id)) return;

    if (existing_text(id, language)) {
      return;
    }

    set_loading_texts(prev => new Set([...prev, id]));

    try {
      const new_text = await get_text(id, language, "all") as Text;
      if (!new_text) throw new Error('Text not found');
      set_texts(prev => [...prev, new_text]);
    } catch (err) {
      set_error(`Failed to load text ${id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      set_loading_texts(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  // ... loads annotations for a text ...
  const load_annotations = async (id: number, language: string) => {
    if (loading_annotations().has(id)) return;

    set_loading_annotations(prev => new Set([...prev, id]));
    try {
      const new_annotations = await get_text(id, language, "annotations") as Annotation[];
      if (new_annotations) {
        set_annotations_map(prev => {
          const next = new Map(prev);
          next.set(id, new_annotations);
          return next;
        });
      }
    } catch (err) {
      set_error(`Failed to load annotations for text ${id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      set_loading_annotations(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  /* ... sets the current text to display and
         reloads annotations if necessary ... */
  const set_inner_text = async (id: number, language: string) => {
    if (!existing_text(id, language)) {
      await load_text(id, language);
    }

    set_current_text(id);

    if (!loading_annotations().has(id)) {
      load_annotations(id, language);
    }
  }

  return (
    <div class={styles.reader}>
      <div class={styles.text_list_wrapper}>
        <Header>
          <span class={styles.text_list_settings}>S</span>
          <span class={styles.header_text}>Texts (κείμενα)</span>
        </Header>
        <TextList items={titles} page={page} set_page={set_page}>
          {
            (text) => <TextListItem text={text} class={() => current_text() == text.id ? styles.text_list_item_selected
              : styles.text_list_item} onclick={async () => await set_inner_text(text.id, "GR")}
              onmouseenter={async () => load_text_with_annotations(text.id, "GR")} />
          }
        </TextList>
      </div>
      <div class={styles.text_display_wrapper}>
        <Header>
        </Header>
        <div class={styles.text_display}>
          <Show when={error()}>
            <div class={styles.error}>{error()}</div>
          </Show>
          <Show when={current_text() !== -1}
            fallback={<div>Select a text to begin</div>}>
            <Show when={!loading_texts().has(current_text())}
              fallback={<div>Loading...</div>}>
              <div class={styles.text_content} innerHTML={
                annotate_text(get_current_text()?.text!, annotations_map().get(current_text()) || [])
              } />
            </Show>
          </Show>
        </div>
      </div>
    </div>
  );
};

interface TextListProps<T extends TextTitle> {
  items: Accessor<T[]>;
  page: Accessor<number>;
  set_page: (page: number) => void;
  children: (item: T) => JSX.Element;
}

/**
 * Component for displaying a list of texts. Implements lazy
 * loading to fetch more texts as the user scrolls.
 * 
 * @param items List of texts to display.
 * @param children Individual text item component.
 * @returns JSX Element for the text list.
 */
const TextList: Component<TextListProps<TextTitle>> = ({ items, page, set_page, children }) => {
  let observer_target!: HTMLDivElement;

  /* onMount(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        set_page(page() + 1);
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
  }) */

  return (
    <div class={styles.text_list}>
      <For each={items()}>
        {children}
      </For>
      <div ref={observer_target} class={styles.loading_buffer} />
    </div>
  );
};

interface TextListItemProps {
  text: TextTitle;
  class?: () => string;
  onclick?: () => void;
  onmouseenter?: () => void;
}

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

const Header: Component<{ children?: JSX.Element }> = (props) => {
  return (
    <div class={styles.header}>
      {props.children}
    </div>
  )
};

export default Index;
