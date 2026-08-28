import { executeMutation, type MutationResult } from "@sun/ssr";

/**
 * Marks a text as viewed.
 */
export async function markViewed(textId: string): Promise<MutationResult> {
  return executeMutation("hades/markViewed", { textId });
}

/**
 * Edits a text.
 */
export async function editText(
  id: string,
  input: { title: string; content: string; language: string; level: string; sourceId?: string | null },
): Promise<MutationResult> {
  return executeMutation("hades/editText", {
    id,
    input: {
      title: input.title,
      content: input.content,
      language: input.language,
      level: input.level,
      sourceId: input.sourceId ?? null,
    },
  });
}
