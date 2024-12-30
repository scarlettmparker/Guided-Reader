import { Title } from '@solidjs/meta';
import { createEffect, createMemo, createSignal, onCleanup, onMount, type Component } from 'solid-js';
import { TextTitle, Text, Annotation, AnnotationData } from '~/utils/types';
import { handle_annotation_click } from '~/utils/render/renderutils';
import { get_titles, get_annotation_data, get_text_data } from '~/utils/textutils';

import TextDisplay from '~/components/TextDisplay';
import AnnotationModal from '~/components/AnnotationModal';
import TextList from '~/components/TextList';
import TextListItem from '~/components/TextListItem';
import Header from '~/components/Header';
import styles from './index.module.css';

const DEFAULT_LANGUAGE = "GR";
const PAGE_SIZE = 335;
const SORT = 0;

interface AnnotationCallbacks {
  current_annotation: () => number;
  set_current_annotation: (annotation: number) => void;
  current_annotation_data: () => AnnotationData[];
}

const Index: Component = () => {
  // ... state for annotation callbacks ...
  const [reader_callbacks, set_reader_callbacks] = createSignal<AnnotationCallbacks>({
    current_annotation: () => -1,
    set_current_annotation: () => { },
    current_annotation_data: () => []
  });

  const callbacks = createMemo(() => reader_callbacks());

  return (
    <>
      <Title>Guided Reader</Title>
      <Reader set_callbacks={set_reader_callbacks} />
      {callbacks().current_annotation() != -1 &&
        <AnnotationModal
          set_current_annotation={(...args) => callbacks().set_current_annotation(...args)}
          current_annotation_data={() => callbacks().current_annotation_data()}
        />
      }
    </>
  );
};

interface ReaderProps {
  set_callbacks: (callbacks: AnnotationCallbacks) => void;
}

/**
 * Main component for the Guided Reader.
 * Contains the text list and the text display, as well as the annotation modal.
 * 
 * @returns JSX Element for the Guided Reader.
 */
const Reader: Component<ReaderProps> = (props) => {
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

  // ... create callbacks for use of state in other components ...
  const callbacks = createMemo<AnnotationCallbacks>(() => ({
    current_annotation: () => current_annotation(),
    set_current_annotation: (annotation: number) => set_current_annotation(annotation),
    current_annotation_data: () => annotation_data()
  }));

  onMount(() => {
    if (!reached_end()) {
      get_titles(page(), PAGE_SIZE, SORT, set_reached_end).then((new_titles) => {
        set_titles(prev => [...prev, ...new_titles]);
      });
    }

    document.addEventListener("click", (e) => handle_annotation_click(e, set_current_annotation));
    props.set_callbacks(callbacks());

    onCleanup(() => {
      document.removeEventListener("click", (e) => handle_annotation_click(e, set_current_annotation));
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

    set_current_annotation(-1);
    set_current_text(id);

    if (!loading_annotations().has(id)) {
      load_annotations(id, language);
    }
  }

  return (
    <div class={styles.reader}>
      <div class={styles.text_list_wrapper}>
        <Header>
          <span class={styles.text_list_hide}>{">"}</span>
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
        <TextDisplay current_text={current_text} loading_texts={loading_texts} error={error}
          annotations_map={annotations_map} get_current_text={get_current_text} />
      </div>
    </div>
  );
};



export default Index;
