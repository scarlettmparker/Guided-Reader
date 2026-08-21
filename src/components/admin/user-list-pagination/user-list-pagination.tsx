import { useTransition } from "react";
import { useSearchParams } from "react-router-dom";
import { Pagination } from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import type { PagedAccounts } from "~/generated/graphql";
import styles from "./user-list-pagination.module.css";

/**
 * Pagination for the admin user list. Shares the same cache key as the list.
 */
const AdminUserListPagination = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, startTransition] = useTransition();
  const search = searchParams.get("search") ?? "";
  const page = Number(searchParams.get("page") ?? "0");
  const { data } = usePageData<PagedAccounts>("accounts", "accounts", {
    page: String(page),
    search: search || undefined,
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
      className={styles.pagination}
      page={page + 1}
      totalPages={pageInfo.totalPages}
      onPageChange={(p: number) => handlePageChange(p - 1)}
    />
  );
};

export default AdminUserListPagination;
