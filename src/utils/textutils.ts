import { BASE_DELAY, ENV, MAX_RETRIES } from "./const";
import { TextTitle, Text, Annotation, AnnotationData, NewAnnotation } from "./types";
import { delay } from "./userutils";

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
  try {
  const response = await fetch(
    `/api/titles?sort=${SORT}&page=${PAGE}&page_size=${PAGE_SIZE}`,
  );

  const data = await response.json();
  if (data.status == 'ok') {
    return data.message;
  } else {
    if (data.message == 'No titles found') {
      set_reached_end(true);
    }
  }
  } catch (error) {
    console.error('Error fetching titles:', error);
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
      `/api/text?text_object_id=${id}&language=${language}&type=${data_type}`,
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
      `/api/annotation?text_id=${id}&start=${start}&end=${end}`,
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
 * Submit the edited annotation. Takes an annotation data object and sends a PATCH request to the server.
 * The annotation data object is constructed from the current annotation data and the new description.
 * 
 * @param annotation_data Annotation data object to submit.
 * @returns Indication of the status of the submission (e.g. Annotation submitted).
 */
export async function submit_annotation_edit(annotation_data: AnnotationData): Promise<string> {
  const REQUEST_TIMEOUT = 1000;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout_id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(`/api/annotation`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Connection": "keep-alive"
          },
          credentials: "include",
          signal: controller.signal,
          body: JSON.stringify(annotation_data)
        }
      );
      if (response.status == 401) {
        return "Unauthorized";
      }
      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error(`Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`, error);
      if (attempt < MAX_RETRIES) {
        const backoff_delay = BASE_DELAY * Math.pow(2, attempt);
        await delay(backoff_delay);
      }
    } finally {
      clearTimeout(timeout_id);
    }
  }
  return "Error";
}

/**
 * Submit a new annotation. Takes an annotation data object and sends a PUT request to the server.
 * The annotation data object is constructed from the current annotation data and the new description.
 * 
 * @param annotation_data Annotation data object to submit.
 * @returns Indication of the status of the submission (e.g. Annotation submitted).
 */
export async function submit_new_annotation(annotation_data: NewAnnotation): Promise<string> {
  const REQUEST_TIMEOUT = 1000;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout_id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(`/api/annotation`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Connection": "keep-alive"
          },
          credentials: "include",
          signal: controller.signal,
          body: JSON.stringify(annotation_data),
        }
      );
      if (response.status == 401) {
        return "Unauthorized";
      }
      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error(`Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`, error);
      if (attempt < MAX_RETRIES) {
        const backoff_delay = BASE_DELAY * Math.pow(2, attempt);
        await delay(backoff_delay);
      }
    } finally {
      clearTimeout(timeout_id);
    }
  }
  return "Error";
}

/**
 * Delete an annotation. Takes an annotation data object and sends a DELETE request to the server.
 * The annotation data object is constructed from the current annotation data.
 * 
 * @param annotation_data Annotation data object to delete.
 * @returns Indication of the status of the deletion (e.g. Annotation deleted).
 */
export async function delete_annotation(annotation_data: AnnotationData): Promise<string> {
  const REQUEST_TIMEOUT = 1000;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout_id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(`/api/annotation`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Connection": "keep-alive"
          },
          credentials: "include",
          signal: controller.signal,
          body: JSON.stringify(annotation_data)
        }
      );
      if (response.status == 401) {
        return "Unauthorized";
      }
      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error(`Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`, error);
      if (attempt < MAX_RETRIES) {
        const backoff_delay = BASE_DELAY * Math.pow(2, attempt);
        await delay(backoff_delay);
      }
    } finally {
      clearTimeout(timeout_id);
    }
  }
  return "Error";
}