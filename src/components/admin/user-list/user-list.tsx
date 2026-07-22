import { Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardHeader, CardTitle, SearchBar, Skeleton } from "@sun/components";
import AdminUserListItems from "~/components/admin/user-list-items";
import AdminUserListFooter from "~/components/admin/user-list-footer";
import AdminUserListPagination from "~/components/admin/user-list-pagination";
import styles from "./user-list.module.css";

type AdminUserListProps = {
  /**
   * Committed search query.
   */
  search: string;
  /**
   * Zero-based page index.
   */
  page: number;
  /**
   * Called when the user submits a search.
   */
  onSearch: (value: string) => void;
  /**
   * Called when the user navigates to a new page.
   */
  onPageChange: (page: number) => void;
  /**
   * Called when an account is clicked.
   */
  onSelect: (id: string) => void;
};

/**
 * Searchable, paginated list of accounts.
 */
const AdminUserList = ({ search, page, onSearch, onPageChange, onSelect }: AdminUserListProps) => {
  const { t } = useTranslation("admin");
  const [searchInput, setSearchInput] = useState(search);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardBody>
          <div className={styles.toolbar}>
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSearch={onSearch}
              placeholder={t("search-placeholder")}
            />
          </div>
          <Suspense
            fallback={
              <div className={styles.skeleton_list}>
                <Skeleton style={{ width: "100%", height: "20rem" }} />
              </div>
            }
          >
            <AdminUserListItems
              search={search}
              page={page}
              onSelect={onSelect}
            />
          </Suspense>
        </CardBody>
        <Suspense fallback={null}>
          <AdminUserListFooter search={search} page={page} />
        </Suspense>
      </Card>
      <Suspense fallback={null}>
        <AdminUserListPagination search={search} page={page} onPageChange={onPageChange} />
      </Suspense>
    </>
  );
};

export default AdminUserList;
