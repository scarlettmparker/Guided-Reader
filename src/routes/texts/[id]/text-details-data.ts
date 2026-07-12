import { defineLoader } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import {
  LocateTextDocument,
  type LocateTextQuery,
  type LocateTextQueryVariables,
} from "~/generated/graphql";

/**
 * Server-side loader for a single text by id.
 */
defineLoader({
  pattern: "texts/:id",
  async loader(params) {
    const id = params.id as string;
    if (!id) return null;
    try {
      const result = await executeDocument<LocateTextQuery, LocateTextQueryVariables>(
        LocateTextDocument,
        { id },
      );
      const text = result.success ? result.data?.hadesQueries.text ?? null : null;
      return { text };
    } catch (error) {
      console.error("Failed to fetch text:", error);
      return { text: null };
    }
  },
});
