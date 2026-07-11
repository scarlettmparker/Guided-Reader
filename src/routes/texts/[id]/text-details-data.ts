import { pageDataRegistry } from "@sun/ssr";
import { fetchText } from "~/utils/api";
import type { LocateTextQuery } from "~/generated/graphql";

/**
 * Server-side loader for a single text by id.
 */
async function getTextDetailData(
  id: string,
): Promise<Record<string, unknown> | null> {
  try {
    const result = await fetchText(id);
    const text = result?.success
      ? (result.data as LocateTextQuery).hadesQueries.text
      : null;
    return { text };
  } catch (error) {
    console.error("Failed to fetch text:", error);
    return { text: null };
  }
}

/**
 * Registers the text detail data loader.
 */
export function registerTextDetailDataLoader(): void {
  pageDataRegistry.registerPageDataLoader("texts/:id", async (params) => {
    const id = params?.id as string;
    if (!id) return null;
    return getTextDetailData(id);
  });
}
