import { Suspense, useTransition } from "react";
import { useSearchParams } from "react-router-dom";
import AdminUserList from "~/components/admin/user-list";
import AdminUserDetail from "~/components/admin/user-detail";
import AdminDetailPlaceholder from "~/components/admin/admin-detail-placeholder";
import { AdminDetailSkeleton } from "~/components/admin/skeletons";
import styles from "./admin.module.css";

const Admin = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, startTransition] = useTransition();
  const search = searchParams.get("search") ?? "";
  const page = Number(searchParams.get("page") ?? "0");
  const selectedId = searchParams.get("selected") ?? null;

  const updateParams = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    return next;
  };

  const handleSearch = (value: string) => {
    const next = updateParams("search", value || null);
    next.delete("page");
    setSearchParams(next);
  };

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      setSearchParams(updateParams("page", newPage > 0 ? String(newPage) : null));
    });
  };

  const handleSelect = (id: string) => {
    setSearchParams(updateParams("selected", id));
  };

  return (
    <div className={styles.items_layout}>
      <div className={styles.items_list_panel}>
        <AdminUserList
          search={search}
          page={page}
          onSearch={handleSearch}
          onPageChange={handlePageChange}
          onSelect={handleSelect}
        />
      </div>
      <div className={styles.items_detail_panel}>
        <Suspense fallback={<AdminDetailSkeleton />}>
          {selectedId ? (
            <AdminUserDetail accountId={selectedId} />
          ) : (
            <AdminDetailPlaceholder />
          )}
        </Suspense>
      </div>
    </div>
  );
};

export default Admin;
