import { defineLoader, type PageDataContext } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import { AUTH_COOKIE, getCookieValue } from "~/utils/auth";
import {
  PrivateNotesDocument,
  type PrivateNotesQuery,
  type PrivateNotesQueryVariables,
} from "~/generated/graphql";

/**
 * Server-side loader for private notes on a text. Forwards the caller's JWT so
 * only the owner's notes are returned.
 */
defineLoader({
  pattern: "privateNotes/:textId",
  async loader(params, context) {
    const textId = params.textId as string;
    if (!textId) return { privateNotes: [] };
    const token = getCookieValue(
      (context as PageDataContext | undefined)?.cookie,
      AUTH_COOKIE,
    );
    try {
      const result = await executeDocument<PrivateNotesQuery, PrivateNotesQueryVariables>(
        PrivateNotesDocument,
        { textId, pagination: { page: 0, size: 100 } },
        token,
      );
      const notes = result.success ? (result.data?.hadesQueries.privateNotes.items ?? []) : [];
      return { privateNotes: notes };
    } catch (error) {
      console.error("Failed to fetch private notes:", error);
      return { privateNotes: [] };
    }
  },
});
