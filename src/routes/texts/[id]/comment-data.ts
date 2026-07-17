import { defineLoader, type PageDataContext } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import { AUTH_COOKIE, getCookieValue } from "~/utils/auth";
import {
  ListCommentsDocument,
  type ListCommentsQuery,
  type ListCommentsQueryVariables,
} from "~/generated/graphql";

/**
 * Server-side loader for comments on an annotation. Author profiles are
 * resolved in the GraphQL layer (gateway `authorProfile` field), not here.
 */
defineLoader({
  pattern: "annotations/:annotationId",
  async loader(params, context) {
    const annotationId = params.annotationId as string;
    if (!annotationId) return null;
    const token = getCookieValue(
      (context as PageDataContext | undefined)?.cookie,
      AUTH_COOKIE,
    );
    try {
      const result = await executeDocument<
        ListCommentsQuery,
        ListCommentsQueryVariables
      >(ListCommentsDocument, { annotationId, includeHidden: false }, token);
      const comments = result.success
        ? (result.data?.hadesQueries.comments.items ?? [])
        : [];
      return { comments };
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      return { comments: [] };
    }
  },
});
