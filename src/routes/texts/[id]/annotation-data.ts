import { pageDataRegistry } from "@sun/ssr";
import { fetchAnnotations } from "~/utils/api";
import type { ListAnnotationsQuery } from "~/generated/graphql";

/**
 * Server-side loader for annotations on a text.
 *
 * @param id the text id
 * @returns the annotations
 */
async function getAnnotationsData(
  id: string,
): Promise<Record<string, unknown> | null> {
  try {
    const result = await fetchAnnotations(id);
    const annotations = result?.success
      ? (result.data as ListAnnotationsQuery).hadesQueries.annotations
      : [];
    return { annotations: annotations ?? [] };
  } catch (error) {
    console.error("Failed to fetch annotations:", error);
    return { annotations: [] };
  }
}

/** Registers the annotations data loader. */
export function registerAnnotationsDataLoader(): void {
  pageDataRegistry.registerPageDataLoader("texts/:id", async (params) => {
    const id = params?.id as string;
    if (!id) return null;
    return getAnnotationsData(id);
  });
}
