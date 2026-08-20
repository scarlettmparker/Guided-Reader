import { defineLoader } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import {
  SearchReaderAccountsDocument,
  type SearchReaderAccountsQuery,
  type SearchReaderAccountsQueryVariables,
} from "~/generated/graphql";

/**
 * Searches reader accounts by username.
 */
defineLoader({
  pattern: "searchReaderAccounts/:query",
  async loader(params) {
    const query = (params.query as string) ?? "";
    if (!query.trim()) return { accounts: [] };
    try {
      const result = await executeDocument<SearchReaderAccountsQuery, SearchReaderAccountsQueryVariables>(
        SearchReaderAccountsDocument,
        { query, pagination: { page: 0, size: 10 } },
      );
      const accounts = result.success ? (result.data?.hadesQueries.searchReaderAccounts ?? []) : [];
      return { accounts };
    } catch (error) {
      console.error("Failed to search accounts:", error);
      return { accounts: [] };
    }
  },
});
