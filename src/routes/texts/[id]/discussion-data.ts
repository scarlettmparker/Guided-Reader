import { defineLoader } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import {
  ThreadsForDocument,
  type ThreadsForQuery,
  type ThreadsForQueryVariables,
} from "~/generated/graphql";

/**
 * Server-side loader for text-level discussion threads. Threads are keyed on a
 * stable remote-object string ("hades:text:<id>").
 */
defineLoader({
  pattern: "texts/:id/discussion",
  async loader(params) {
    const id = params.id as string;
    if (!id) return null;
    const remoteObject = `hades:text:${id}`;
    try {
      const result = await executeDocument<
        ThreadsForQuery,
        ThreadsForQueryVariables
      >(ThreadsForDocument, { remoteObject });
      const threads = result.success
        ? (result.data?.icarusQueries.threadsFor.items ?? [])
        : [];
      return { threads };
    } catch (error) {
      console.error("Failed to fetch discussion threads:", error);
      return { threads: [] };
    }
  },
});
