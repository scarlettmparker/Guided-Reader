import { defineLoader } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import {
  ListTextsDocument,
  type ListTextsQuery,
  type ListTextsQueryVariables,
  type PaginationInput,
  SortDirection,
  FilterOperator,
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
 * Server-side paginated texts loader with search and level filters.
 */
defineLoader({
  pattern: "texts",
  async loader(params) {
    const page = Number(params.page ?? 0);
    const search = params.search as string | undefined;
    const levels = params.levels as string[] | undefined;

    const filters: Array<{
      field: string;
      operator: FilterOperator;
      value: string;
    }> = [];
    if (search) {
      filters.push({
        field: "title",
        operator: FilterOperator.Matches,
        value: search,
      });
    }
    if (levels && levels.length > 0) {
      filters.push({
        field: "level",
        operator: FilterOperator.In,
        value: levels.join(","),
      });
    }

    const pagination: PaginationInput = {
      page,
      size: 10,
      sortBy: "level",
      sortDir: SortDirection.Asc,
      filters: filters.length > 0 ? filters : undefined,
    };

    try {
      const result = await executeDocument<
        ListTextsQuery,
        ListTextsQueryVariables
      >(ListTextsDocument, { pagination });
      const texts = result.success ? result.data?.hadesQueries.texts : null;
      return { texts: texts ?? EMPTY_PAGE };
    } catch (error) {
      console.error("Failed to fetch texts:", error);
      return { texts: EMPTY_PAGE };
    }
  },
});
