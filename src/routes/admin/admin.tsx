import { Suspense, useCallback, useState } from "react";
import { useOutlet } from "react-router-dom";
import { patchPageData, revalidatePageData } from "@sun/ssr";
import type { AccountQuery } from "~/generated/graphql";
import AdminUserList from "~/components/admin/user-list";
import AdminDetailPlaceholder from "~/components/admin/admin-detail-placeholder";
import { AdminDetailSkeleton } from "~/components/admin/skeletons";
import ConfirmSuspendAccountDialog from "~/components/admin/confirm-suspend-account-dialog";
import ConfirmUnsuspendAccountDialog from "~/components/admin/confirm-unsuspend-account-dialog";
import { suspendAccount, unsuspendAccount } from "~/server/actions/roles";
import styles from "./admin.module.css";

type AccountData = AccountQuery["gaiaQueries"]["account"];

type AccountRef = {
  /**
   * Account id.
   */
  id: string;
  /**
   * Account username.
   */
  username: string;
};

const Admin = () => {
  const outlet = useOutlet();
  const [suspendTarget, setSuspendTarget] = useState<AccountRef | null>(null);
  const [unsuspendTarget, setUnsuspendTarget] = useState<AccountRef | null>(
    null,
  );

  const handleSuspend = useCallback(async () => {
    if (!suspendTarget) return;
    const id = suspendTarget.id;
    setSuspendTarget(null);
    try {
      const response = await suspendAccount(id);
      patchPageData<AccountData>(
        "account",
        "admin/:id",
        { id },
        () => response.account,
      );
      revalidatePageData();
    } catch {
      return;
    }
  }, [suspendTarget]);

  const handleUnsuspend = useCallback(async () => {
    if (!unsuspendTarget) return;
    const id = unsuspendTarget.id;
    setUnsuspendTarget(null);
    try {
      const response = await unsuspendAccount(id);
      patchPageData<AccountData>(
        "account",
        "admin/:id",
        { id },
        () => response.account,
      );
      revalidatePageData();
    } catch {
      return;
    }
  }, [unsuspendTarget]);

  return (
    <div className={styles.items_layout}>
      <div className={styles.items_list_panel}>
        <AdminUserList
          onSuspend={setSuspendTarget}
          onUnsuspend={setUnsuspendTarget}
        />
      </div>
      <div className={styles.items_detail_panel}>
        <Suspense fallback={<AdminDetailSkeleton />}>
          {outlet ?? <AdminDetailPlaceholder />}
        </Suspense>
      </div>
      {suspendTarget && (
        <ConfirmSuspendAccountDialog
          open={!!suspendTarget}
          onClose={() => setSuspendTarget(null)}
          onConfirm={handleSuspend}
          username={suspendTarget.username}
        />
      )}
      {unsuspendTarget && (
        <ConfirmUnsuspendAccountDialog
          open={!!unsuspendTarget}
          onClose={() => setUnsuspendTarget(null)}
          onConfirm={handleUnsuspend}
          username={unsuspendTarget.username}
        />
      )}
    </div>
  );
};

export default Admin;
