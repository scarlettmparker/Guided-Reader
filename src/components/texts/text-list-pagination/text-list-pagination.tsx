import { useTransition } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePageData } from "@sun/ssr/react";
import { Pagination } from "@sun/components";
import type { ListTextsQuery } from "~/generated/graphql";

type PagedTexts = ListTextsQuery["hadesQueries"]["texts"];

/**
 * Renders pagination for the text list. Shares the same cache key as TextListItems.
 */
const TextListPagination = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { className, ...rest } = props;
  useTranslation("texts");
  const [searchParams, setSearchParams] = useSearchParams();
  const [, startTransition] = useTransition();
  const search = searchParams.get("search") ?? "";
  const levels = searchParams.get("levels")?.split(",").filter(Boolean) ?? [];
  const page = Number(searchParams.get("page") ?? "0");
  const { data } = usePageData<PagedTexts>("texts", "texts", {
    page,
    search: search || undefined,
    levels: levels.length > 0 ? levels : undefined,
  });

  const pageInfo = data?.pageInfo;

  if (!pageInfo || pageInfo.totalPages <= 1) {
    return null;
  }

  /**
   * Handles page change via URL params.
   */
  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const next = new URLSearchParams(searchParams);
      if (newPage > 0) next.set("page", String(newPage));
      else next.delete("page");
      setSearchParams(next);
    });
  };

  return (
    <Pagination
      className={className}
      page={page + 1}
      totalPages={pageInfo.totalPages}
      onPageChange={(p: number) => handlePageChange(p - 1)}
      {...rest}
    />
  );
};

export default TextListPagination;
