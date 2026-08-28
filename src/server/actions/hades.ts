import { executeMutation, type MutationResult } from "@sun/ssr";

/**
 * Marks a text as viewed.
 */
export async function markViewed(textId: string): Promise<MutationResult> {
  return executeMutation("hades/markViewed", { textId });
}
