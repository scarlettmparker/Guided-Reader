import { pageDataRegistry } from "@sun/ssr";
import { fetchAnnotations } from "~/utils/api";
import { AUTH_COOKIE, getCookieValue } from "~/utils/auth";
import type { ListAnnotationsQuery } from "~/generated/graphql";

/**
 * Server-side loader for annotations on a text. Forwards the caller's JWT so
 * the backend can resolve each annotation's `myVote`.
 *
 * @param id the text id
 * @param authToken the caller's JWT, or undefined
 * @returns the annotations
 */
async function getAnnotationsData(
  id: string,
  authToken?: string,
): Promise<Record<string, unknown> | null> {
  try {
    const result = await fetchAnnotations(id, false, authToken);
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
  pageDataRegistry.registerPageDataLoader("texts/:id", async (params, context) => {
    const id = params?.id as string;
    if (!id) return null;
    const token = getCookieValue(context?.cookie, AUTH_COOKIE);
    return getAnnotationsData(id, token);
  });
}
