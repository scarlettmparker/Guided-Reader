import { Pagination } from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import type { PagedAccounts } from "~/generated/graphql";
import styles from "./user-list-pagination.module.css";

type AdminUserListPaginationProps = {
  /**
   * Zero-based page index.
   */
  page: number;
  /**
   * Committed search query.
   */
  search: string;
  /**
   * Called when the user navigates to a new page.
   */
  onPageChange: (page: number) => void;
};

/**
 * Pagination for the admin user list. Shares the same cache key as the list.
 */
const AdminUserListPagination = ({ page, search, onPageChange }: AdminUserListPaginationProps) => {
  const { data } = usePageData<PagedAccounts>("accounts", "accounts", {
    page,
    search: search || undefined,
  });

  const pageInfo = data?.pageInfo;

  if (!pageInfo || pageInfo.totalPages <= 1) {
    return null;
  }

  return (
    <Pagination
      className={styles.pagination}
      page={page + 1}
      totalPages={pageInfo.totalPages}
      onPageChange={(p: number) => onPageChange(p - 1)}
    />
  );
};

export default AdminUserListPagination;
