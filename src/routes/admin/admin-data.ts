import { defineLoader } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import { AUTH_COOKIE, getCookieValue } from "~/utils/auth";
import {
  AccountDocument,
  AccountsDocument,
  FilterOperator,
  SortDirection,
  type AccountQuery,
  type AccountQueryVariables,
  type AccountsQuery,
  type AccountsQueryVariables,
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
 * Paginated accounts loader for the admin page.
 */
defineLoader({
  pattern: "accounts",
  async loader(params, context) {
    const token = getCookieValue(context?.cookie, AUTH_COOKIE);
    if (!token) return { accounts: EMPTY_PAGE };
    const page = Number(params.page ?? 0);
    const search = params.search as string | undefined;
    const filters = search
      ? [{ field: "username", operator: FilterOperator.Matches, value: search }]
      : undefined;

    try {
      const result = await executeDocument<AccountsQuery, AccountsQueryVariables>(
        AccountsDocument,
        { pagination: { page, size: 20, sortBy: "username", sortDir: SortDirection.Asc, filters } },
        token,
      );
      const data = result.data?.gaiaQueries?.accounts;
      return { accounts: data ?? EMPTY_PAGE };
    } catch {
      return { accounts: EMPTY_PAGE };
    }
  },
});

/**
 * Loads a single account by ID for the admin detail panel.
 */
defineLoader({
  pattern: "admin/:id",
  async loader(params, context) {
    const id = params.id as string;
    if (!id) return { account: null };
    const token = getCookieValue(context?.cookie, AUTH_COOKIE);
    if (!token) return { account: null };
    try {
      const result = await executeDocument<AccountQuery, AccountQueryVariables>(
        AccountDocument,
        { id },
        token,
      );
      return { account: result.data?.gaiaQueries?.account ?? null };
    } catch {
      return { account: null };
    }
  },
});
