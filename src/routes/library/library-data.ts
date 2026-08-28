import { defineLoader, type PageDataContext } from "@sun/ssr";
import { AUTH_COOKIE, getCookieValue } from "~/utils/auth";
import { executeDocument } from "~/utils/api";
import {
  ViewedTextsDocument,
  type ViewedTextsQuery,
  type ViewedTextsQueryVariables,
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
 * Loads the current user's viewed texts for the library.
 */
defineLoader({
  pattern: "library",
  async loader(_params, context) {
    const token = getCookieValue(
      (context as PageDataContext | undefined)?.cookie,
      AUTH_COOKIE,
    );
    if (!token) return { viewedTexts: EMPTY_PAGE };
    try {
      const result = await executeDocument<ViewedTextsQuery, ViewedTextsQueryVariables>(
        ViewedTextsDocument,
        { pagination: { page: 0, size: 10 } },
        token,
      );
      const viewedTexts = result.success ? result.data?.hadesQueries.viewedTexts : null;
      return { viewedTexts: viewedTexts ?? EMPTY_PAGE };
    } catch (error) {
      console.error("Failed to fetch viewed texts:", error);
      return { viewedTexts: EMPTY_PAGE };
    }
  },
});
