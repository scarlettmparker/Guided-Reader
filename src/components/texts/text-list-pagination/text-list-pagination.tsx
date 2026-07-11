import { useTranslation } from "react-i18next";
import { usePageData } from "@sun/ssr/react";
import { Pagination } from "@sun/components";
import type { ListTextsQuery } from "~/generated/graphql";

type PagedTexts = ListTextsQuery["hadesQueries"]["texts"];

type TextListPaginationProps = {
  /**
   * Zero-based page index.
   */
  page: number;
  /**
   * Committed search query (empty string for no filter).
   */
  search: string;
  /**
   * Selected CEFR levels (empty for no filter).
   */
  levels: string[];
  /**
   * Called when the user navigates to a new page.
   *
   * @param page the new zero-based page index
   */
  onPageChange: (page: number) => void;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Renders pagination for the text list. Shares the same cache key as TextListItems.
 *
 * @param page zero-based page index
 * @param search committed search query
 * @param levels selected CEFR levels
 * @param onPageChange callback on page navigation
 */
const TextListPagination = ({
  page,
  search,
  levels,
  onPageChange,
  ...rest
}: TextListPaginationProps) => {
  useTranslation("texts");
  const { data } = usePageData<PagedTexts>("texts", "texts", {
    page,
    search: search || undefined,
    levels: levels.length > 0 ? levels : undefined,
  });

  const pageInfo = data?.pageInfo;

  if (!pageInfo || pageInfo.totalPages <= 1) {
    return null;
  }

  return (
    <Pagination
      page={page + 1}
      totalPages={pageInfo.totalPages}
      onPageChange={(p: number) => onPageChange(p - 1)}
      {...rest}
    />
  );
};

export default TextListPagination;
