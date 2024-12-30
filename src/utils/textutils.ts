import { ENV } from "./const";
import { TextTitle, Text, Annotation, AnnotationData } from "./types";

/**
 * Fetches a list of text titles from the server given a page number, page size, and sort order.
 * SORT ORDERS: 0 - ASCENDING BY ID.
 * 
 * @param PAGE Page number to fetch.
 * @param PAGE_SIZE Number of items to fetch per page.
 * @param SORT Sort order for the fetched items.
 * @returns List of text titles.
 */
export async function get_titles(
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
export async function get_text_data(id: number, language: string, data_type: string): Promise<Text | Annotation[]> {
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
export async function get_annotation_data(id: number, start: number, end: number): Promise<AnnotationData[]> {
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
