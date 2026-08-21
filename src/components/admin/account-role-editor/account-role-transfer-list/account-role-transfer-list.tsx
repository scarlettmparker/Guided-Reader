import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@sun/components";
import type { RolesQuery } from "~/generated/graphql";
import { PermissionColumn, TransferActions, usePermissionTransfer } from "~/components/admin/shared/permission-transfer";
import styles from "./account-role-transfer-list.module.css";

type RolesData = RolesQuery["gaiaQueries"]["roles"];

type AccountRoleTransferListProps = {
  /**
   * All roles.
   */
  roles: RolesData;
  /**
   * Assigned role names.
   */
  assignedRoleNames: string[];
  /**
   * Called with next assigned names.
   */
  onChange: (next: string[]) => void;
} & Omit<React.HTMLAttributes<HTMLElement>, "onChange">;

/**
 * Purpose-specific transfer list for account roles.
 */
const AccountRoleTransferList = (props: AccountRoleTransferListProps) => {
  const { roles, assignedRoleNames, onChange, className, ...rest } = props;
  const { t } = useTranslation("admin");
  const catalog = useMemo(() => (roles ?? []).map((role) => role.name).sort((a, b) => a.localeCompare(b)), [roles]);

  const {
    available,
    assigned,
    left,
    right,
    moveSelectedToAssigned,
    moveSelectedToAvailable,
    moveAllToAssigned,
    moveAllToAvailable,
  } = usePermissionTransfer(catalog, assignedRoleNames, onChange);

  return (
    <section className={cn(styles.transfer, className)} {...rest}>
      <PermissionColumn
        title={t("available-roles")}
        items={available}
        selected={left.selected}
        paint={left}
        placeholder={t("search-roles")}
        emptyLabel={t("no-roles-found")}
      />
      <TransferActions
        left={{
          hasSelected: left.selected.size > 0,
          hasItems: available.length > 0,
          onMoveSelected: moveSelectedToAssigned,
          onMoveAll: moveAllToAssigned,
        }}
        right={{
          hasSelected: right.selected.size > 0,
          hasItems: assigned.length > 0,
          onMoveSelected: moveSelectedToAvailable,
          onMoveAll: moveAllToAvailable,
        }}
      />
      <PermissionColumn
        title={t("assigned-roles")}
        items={assigned}
        selected={right.selected}
        paint={right}
        placeholder={t("search-roles")}
        emptyLabel={t("no-roles-found")}
      />
    </section>
  );
};

export default AccountRoleTransferList;
