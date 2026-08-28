import { defineLoader, type PageDataContext } from "@sun/ssr";
import { AUTH_COOKIE, getCookieValue } from "~/utils/auth";
import { executeDocument } from "~/utils/api";
import {
  ViewedReaderTextsDocument,
  type ViewedReaderTextsQuery,
  type ViewedReaderTextsQueryVariables,
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
    const pagination = (_params.pagination as {
      page: number;
      size: number;
    }) ?? {
      page: 0,
      size: 5,
    };
    try {
      const result = await executeDocument<
        ViewedReaderTextsQuery,
        ViewedReaderTextsQueryVariables
      >(ViewedReaderTextsDocument, { pagination }, token);
      const viewedTexts = result.success
        ? result.data?.hadesQueries.viewedReaderTexts
        : null;
      return { viewedTexts: viewedTexts ?? EMPTY_PAGE };
    } catch (error) {
      console.error("Failed to fetch viewed texts:", error);
      return { viewedTexts: EMPTY_PAGE };
    }
  },
});
