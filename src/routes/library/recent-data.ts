import { defineLoader, makeCacheKey, sharedCall, SHARED_TTL } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import {
  ListTextsDocument,
  type ListTextsQuery,
  type ListTextsQueryVariables,
  SortDirection,
} from "~/generated/graphql";

const EMPTY_PAGE = {
  items: [],
  pageInfo: {
    page: 0,
    size: 0,
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

/**
 * Loads recent texts sorted by creation time for the library.
 */
defineLoader({
  pattern: "recent",
  async loader() {
    const pagination = {
      page: 0,
      size: 10,
      sortBy: "createdAt",
      sortDir: SortDirection.Desc,
    };
    const result = await sharedCall(
      makeCacheKey("recent", pagination),
      SHARED_TTL.LIST,
      async () => {
        const res = await executeDocument<
          ListTextsQuery,
          ListTextsQueryVariables
        >(ListTextsDocument, { pagination });
        if (!res.success) {
          throw new Error(res.error ?? "recent texts unavailable");
        }
        return res;
      },
    ).catch((error) => {
      console.error("Failed to fetch recent texts:", error);
      return null;
    });
    return { recentTexts: result?.data?.hadesQueries.texts ?? EMPTY_PAGE };
  },
});
