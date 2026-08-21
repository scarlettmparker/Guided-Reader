import { Suspense } from "react";
import { useOutlet } from "react-router-dom";
import AdminUserList from "~/components/admin/user-list";
import AdminDetailPlaceholder from "~/components/admin/admin-detail-placeholder";
import { AdminDetailSkeleton } from "~/components/admin/skeletons";
import styles from "./admin.module.css";

const Admin = () => {
  const outlet = useOutlet();

  return (
    <div className={styles.items_layout}>
      <div className={styles.items_list_panel}>
        <AdminUserList />
      </div>
      <div className={styles.items_detail_panel}>
        <Suspense fallback={<AdminDetailSkeleton />}>
          {outlet ?? <AdminDetailPlaceholder />}
        </Suspense>
      </div>
    </div>
  );
};

export default Admin;
