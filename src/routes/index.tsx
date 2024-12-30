import { Title } from '@solidjs/meta';
import { Accessor, createEffect, createMemo, createSignal, For, JSX, onCleanup, onMount, Show, type Component } from 'solid-js';
import { ENV } from '~/const';
import { TextTitle, Text, Annotation, AnnotationData } from '~/types';
import { render_annotated_text } from '~/utils/render/renderutils';
import styles from './index.module.css';
import { SolidMarkdown } from "solid-markdown";

const Index: Component = () => {
  return (
    <>
      <Title>Guided Reader</Title>
      <Reader />
    </>
  );
};

const DEFAULT_LANGUAGE = "GR";
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
async function get_text_data(id: number, language: string, data_type: string): Promise<Text | Annotation[]> {
  const controller = new AbortController();
  const timeout_id = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(
      `http://${ENV.VITE_SERVER_HOST}:${ENV.VITE_SERVER_PORT}/text?text_object_id=${id}&language=${language}&type=${data_type}`,
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
      return data.message[0];
    }

    throw new Error('Invalid response format');
  } catch (error) {
    return { annotations: [], id: -1, text: '', language: '', text_object_id: -1 };
  } finally {
    clearTimeout(timeout_id);
  }
}

/**
 * Fetches annotation data from the server given a text ID and a range of text indices.
 * Annotation data includes the annotation description, likes, dislikes, creation date, and user ID.
 * See back-end API for more details (documentation and doc-strings in code).
 * 
 * @param id Text ID to fetch annotations for.
 * @param start Start index of the text range to fetch annotations for.
 * @param end End index of the text range to fetch annotations for.
 * @returns List of annotation data.
 */
async function get_annotation_data(id: number, start: number, end: number): Promise<AnnotationData[]> {
  const controller = new AbortController();
  const timeout_id = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(
      `http://${ENV.VITE_SERVER_HOST}:${ENV.VITE_SERVER_PORT}/annotation?text_id=${id}&start=${start}&end=${end}`,
      {
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.status === 'ok') {
      return data.message;
    }

    throw new Error('Invalid response format');
  } catch (error) {
    return [];
  } finally {
    clearTimeout(timeout_id);
  }
}

/**
 * Handles a click event on the document. This function is used to detect clicks on annotated text.
 * @param event Click event.
 * @param set_current_annotation Function to set the current annotation.
 */
const handle_click = (event: Event, set_current_annotation: (annotation: number) => void) => {
  const target = event.target as HTMLElement;
  if (target.id.startsWith("annotated-text-")) {
    const annotation_id = parseInt(target.id.split("-")[2], 10);
    set_current_annotation(annotation_id);
  }
};

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

  // ... state for annotations and annotation data ...
  const [current_annotation, set_current_annotation] = createSignal(-1);
  const [annotation_data, set_annotation_data] = createSignal<AnnotationData[]>([]);

  const [page, set_page] = createSignal(0);
  const [reached_end, set_reached_end] = createSignal(false);

  onMount(() => {
    if (!reached_end()) {
      get_titles(page(), PAGE_SIZE, SORT, set_reached_end).then((new_titles) => {
        set_titles(prev => [...prev, ...new_titles]);
      });
    }
    document.addEventListener("click", (e) => handle_click(e, set_current_annotation));
    onCleanup(() => {
      document.removeEventListener("click", (e) => handle_click(e, set_current_annotation));
    });
  });

  // ... fetches annotation data when clicking on an annotation ...
  createEffect(async () => {
    if (current_annotation() != -1) {
      const annotation = annotations_map().get(current_text())?.find(ann => ann.id === current_annotation());
      set_annotation_data(await get_annotation_data(current_text(), annotation!.start, annotation!.end));
    } else {
      set_annotation_data([]);
    }
  })

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
    set_current_annotation(-1);

    try {
      const new_text = await get_text_data(id, language, "all") as Text;
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
      const new_annotations = await get_text_data(id, language, "annotations") as Annotation[];
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
              : styles.text_list_item} onclick={async () => await set_inner_text(text.id, DEFAULT_LANGUAGE)}
              onmouseenter={async () => load_text_with_annotations(text.id, DEFAULT_LANGUAGE)} />
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
      {current_annotation() !== -1 &&
        <AnnotationModal set_current_annotation={set_current_annotation} current_annotation_data={annotation_data} />}
    </div>
  );
};

interface AnnotationProps {
  set_current_annotation: (annotation: number) => void;
  current_annotation_data: Accessor<AnnotationData[]>;
}

/**
 * Component for displaying an annotation modal. This modal will display the annotation data.
 * It will also allow the user to interact with the annotation, e.g. like or dislike or provide a correction.
 * 
 * @param set_current_annotation Function to set the current annotation.
 * @param current_annotation_data Current annotation data.
 * @returns JSX Element for the annotation modal.
 */
const AnnotationModal: Component<AnnotationProps> = ({ set_current_annotation, current_annotation_data }) => {
  return (
    <div class={styles.annotation_modal}>
      <div class={styles.annotation_modal_header}>
        <span>Annotation</span>
        <span class={styles.close} onclick={() => set_current_annotation(-1)}>X</span>
      </div>
      <div class={styles.annotation_modal_content}>
        {current_annotation_data().map(annotation => (
          <AnnotationItem annotation={annotation} />
        ))}
      </div>
    </div>
  )
}

interface AnnotationItemProps {
  annotation: AnnotationData;
}

/**
 * Component for displaying an individual annotation item.
 * Annotation items include the annotation description, likes, dislikes, creation date, and username.
 * 
 * @param annotation Annotation data to display.
 * @returns JSX Element for the annotation item.
 */
const AnnotationItem: Component<AnnotationItemProps> = ({ annotation }) => {
  return (
    <div class={styles.annotation_item}>
      <SolidMarkdown children={annotation.description} />
    </div>
  )
}

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
