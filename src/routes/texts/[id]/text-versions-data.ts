import { defineLoader } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import {
  TextVersionsDocument,
  type TextVersionsQuery,
  type TextVersionsQueryVariables,
} from "~/generated/graphql";

/**
 * Loads version history for a text.
 */
defineLoader({
  pattern: "texts/:id/versions",
  async loader(params) {
    const textId = params.id as string;
    if (!textId) return { versions: [] };
    try {
      const result = await executeDocument<TextVersionsQuery, TextVersionsQueryVariables>(
        TextVersionsDocument,
        { textId },
      );
      const versions = result.success ? result.data?.hadesQueries.textVersions : null;
      return { versions: versions ?? [] };
    } catch (error) {
      console.error("Failed to fetch text versions:", error);
      return { versions: [] };
    }
  },
});
