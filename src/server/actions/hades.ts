import { executeMutation } from "@sun/ssr";
import type { MarkViewedResponse } from "~/generated/graphql";

/**
 * Marks a text as viewed.
 */
export async function markViewed(textId: string): Promise<MarkViewedResponse> {
  return executeMutation<MarkViewedResponse>("hades/markViewed", { textId });
}
