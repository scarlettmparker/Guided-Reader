import { BASE_DELAY, MAX_RETRIES } from "./const";
import { Interaction } from "./types";
import { delay } from "./userutils";

export async function get_interactions(annotation_id: number): Promise<Interaction[]> {
  const REQUEST_TIMEOUT = 5000;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout_id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(
        `/api/vote?annotation_id=${annotation_id}`,
        {
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'ok') {
        const interactions = data.message.map((item: { interaction: Interaction }) => item.interaction);
        return interactions;
      }

      throw new Error('Invalid response format');
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
  return [];
}

type InteractionResponse = {
  success: boolean;
  message: string;
}

export async function post_interaction(
  user_id: number, annotation_id: number, interaction: number
): Promise<InteractionResponse> {
  const REQUEST_TIMEOUT = 5000;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout_id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(
        `/api/vote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user_id,
            annotation_id: annotation_id,
            interaction: interaction,
          }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'ok') {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
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
  return { success: false, message: 'An unknown error has occured' };
}