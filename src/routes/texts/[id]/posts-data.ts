import { defineLoader, type PageDataContext } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import { AUTH_COOKIE, getCookieValue } from "~/utils/auth";
import {
  ListPostsDocument,
  type ListPostsQuery,
  type ListPostsQueryVariables,
} from "~/generated/graphql";

/**
 * Server-side loader for posts in a discussion thread. Author profiles are
 * resolved in the GraphQL layer (gateway `authorProfile` field), not here.
 */
defineLoader({
  pattern: "threads/:threadId",
  async loader(params, context) {
    const threadId = params.threadId as string;
    if (!threadId) return null;
    const token = getCookieValue(
      (context as PageDataContext | undefined)?.cookie,
      AUTH_COOKIE,
    );
    try {
      const result = await executeDocument<
        ListPostsQuery,
        ListPostsQueryVariables
      >(ListPostsDocument, { threadId, includeHidden: false }, token);
      const posts = result.success
        ? (result.data?.icarusQueries.posts.items ?? [])
        : [];
      return { posts };
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      return { posts: [] };
    }
  },
});
