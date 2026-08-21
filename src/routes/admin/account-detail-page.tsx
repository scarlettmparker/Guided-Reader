import { Suspense } from "react";
import { useParams } from "react-router-dom";
import { Skeleton } from "@sun/components";
import AdminUserDetail from "~/components/admin/user-detail";
import AccountRoleEditor from "~/components/admin/account-role-editor";
import AccountPermissionEditor from "~/components/admin/account-permission-editor";
import styles from "./account-detail-page.module.css";

const AccountDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) return null;

  return (
    <div className={styles.detail_stack}>
      <AdminUserDetail accountId={id} />
      <Suspense fallback={<Skeleton style={{ height: "12rem" }} />}>
        <AccountRoleEditor accountId={id} />
      </Suspense>
      <Suspense fallback={<Skeleton style={{ height: "12rem" }} />}>
        <AccountPermissionEditor accountId={id} />
      </Suspense>
    </div>
  );
};

export default AccountDetailPage;
