import { defineLoader } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import {
  ListTextsDocument,
  type ListTextsQuery,
  type ListTextsQueryVariables,
  SortDirection,
} from "~/generated/graphql";

/**
 * Loads recent texts sorted by creation time for the library.
 */
defineLoader({
  pattern: "recent",
  async loader() {
    try {
      const result = await executeDocument<
        ListTextsQuery,
        ListTextsQueryVariables
      >(ListTextsDocument, {
        pagination: {
          page: 0,
          size: 10,
          sortBy: "createdAt",
          sortDir: SortDirection.Desc,
        },
      });
      const texts = result.success ? result.data?.hadesQueries.texts : null;
      return {
        recentTexts: texts ?? {
          items: [],
          pageInfo: {
            page: 0,
            size: 0,
            totalPages: 0,
            totalCount: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      };
    } catch (error) {
      console.error("Failed to fetch recent texts:", error);
      return {
        recentTexts: {
          items: [],
          pageInfo: {
            page: 0,
            size: 0,
            totalPages: 0,
            totalCount: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      };
    }
  },
});
