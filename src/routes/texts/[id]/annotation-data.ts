import { defineLoader, type PageDataContext } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import { AUTH_COOKIE, getCookieValue } from "~/utils/auth";
import {
  ListAnnotationsDocument,
  type ListAnnotationsQuery,
  type ListAnnotationsQueryVariables,
} from "~/generated/graphql";

/**
 * Server-side loader for annotations on a text. Forwards the caller's JWT so
 * the backend can resolve each annotation's `myVote`.
 */
defineLoader({
  pattern: "texts/:id",
  async loader(params, context) {
    const id = params.id as string;
    if (!id) return null;
    const token = getCookieValue(
      (context as PageDataContext | undefined)?.cookie,
      AUTH_COOKIE,
    );
    try {
      const result =
        await executeDocument<ListAnnotationsQuery, ListAnnotationsQueryVariables>(
          ListAnnotationsDocument,
          { textId: id, includeHidden: false },
          token,
        );
      const annotations = result.success
        ? result.data?.hadesQueries.annotations ?? []
        : [];
      return { annotations };
    } catch (error) {
      console.error("Failed to fetch annotations:", error);
      return { annotations: [] };
    }
  },
});
