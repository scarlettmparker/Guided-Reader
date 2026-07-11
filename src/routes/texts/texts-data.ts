import { pageDataRegistry } from "@sun/ssr";
import { fetchTexts } from "~/utils/api";
import {
  ListTextsQuery,
  PaginationInput,
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
async function getTextsData(
  params?: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  const page = Number(params?.page ?? 0);
  const search = params?.search as string | undefined;
  const levels = params?.levels as string[] | undefined;

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
    const result = await fetchTexts(pagination);
    const texts = result?.success
      ? (result.data as ListTextsQuery).hadesQueries.texts
      : EMPTY_PAGE;
    return { texts: texts ?? EMPTY_PAGE };
  } catch (error) {
    console.error("Failed to fetch texts:", error);
    return { texts: EMPTY_PAGE };
  }
}

/**
 * Registers the texts list data loader.
 */
export function registerTextsDataLoader(): void {
  pageDataRegistry.registerPageDataLoader("texts", getTextsData);
}
