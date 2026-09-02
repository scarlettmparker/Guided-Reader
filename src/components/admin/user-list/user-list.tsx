import { Suspense, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  SearchBar,
  Skeleton,
} from "@sun/components";
import AdminUserListItems from "~/components/admin/user-list-items";
import AdminUserListFooter from "~/components/admin/user-list-footer";
import AdminUserListPagination from "~/components/admin/user-list-pagination";
import styles from "./user-list.module.css";

type AdminUserListProps = {
  /**
   * Called when suspend is requested.
   */
  onSuspend: (account: { id: string; username: string }) => void;
  /**
   * Called when unsuspend is requested.
   */
  onUnsuspend: (account: { id: string; username: string }) => void;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "onSuspend">;

/**
 * Searchable, paginated list of accounts.
 */
const AdminUserList = (props: AdminUserListProps) => {
  const { onSuspend, onUnsuspend } = props;
  const { t } = useTranslation("admin");
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const [searchInput, setSearchInput] = useState(search);

  /**
   * Updates search query and resets pagination.
   */
  const handleSearch = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("search", value);
    else next.delete("search");
    next.delete("page");
    setSearchParams(next);
  };

  return (
    <>
      <Card>
        <CardHeader className={styles.header}>
          <CardTitle>{t("title")}</CardTitle>
          <Link to="/admin/property-sets" className={styles.header_link}>
            <Button
              variant="secondary"
              title={t("property-sets")}
              aria-label={t("property-sets")}
            >
              {t("property-sets")}
            </Button>
          </Link>
        </CardHeader>
        <CardBody>
          <div className={styles.toolbar}>
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSearch={handleSearch}
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
              onSuspend={onSuspend}
              onUnsuspend={onUnsuspend}
            />
          </Suspense>
        </CardBody>
        <Suspense fallback={null}>
          <AdminUserListFooter />
        </Suspense>
      </Card>
      <Suspense fallback={null}>
        <AdminUserListPagination />
      </Suspense>
    </>
  );
};

export default AdminUserList;
