import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Input, cn } from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import type { AllPermissionsQuery } from "~/generated/graphql";
import { PermissionColumn, TransferActions, usePermissionTransfer } from "~/components/admin/shared/permission-transfer";
import styles from "./role-permission-list.module.css";

type AllPermissionsData = AllPermissionsQuery["gaiaQueries"]["allPermissions"];

type RolePermissionListProps = {
  /**
   * Assigned permission strings for the role.
   */
  assignedPermissions: string[];
  /**
   * Called with next assigned list.
   */
  onChange: (next: string[]) => void;
} & Omit<React.HTMLAttributes<HTMLElement>, "onChange">;

/**
 * Purpose-specific permission list for a role.
 */
const RolePermissionList = (props: RolePermissionListProps) => {
  const { assignedPermissions, onChange, className, ...rest } = props;
  const { t } = useTranslation("admin");
  const { data: allPermissions } = usePageData<AllPermissionsData>("allPermissions", "admin/all-permissions", {});
  const catalog = (allPermissions ?? []) as string[];
  const [input, setInput] = useState("");

  const {
    available,
    assigned,
    left,
    right,
    moveSelectedToAssigned,
    moveSelectedToAvailable,
    moveAllToAssigned,
    moveAllToAvailable,
  } = usePermissionTransfer(catalog, assignedPermissions, onChange);

  /**
   * Adds a custom permission.
   */
  const handleAdd = () => {
    const value = input.trim();
    if (!value || assigned.includes(value)) {
      setInput("");
      return;
    }
    onChange([...assigned, value].sort((a, b) => a.localeCompare(b)));
    setInput("");
  };

  return (
    <section className={cn(styles.list_section, className)} {...rest}>
      <fieldset className={styles.input_fieldset}>
        <legend className={styles.legend}>{t("role-permissions-title")}</legend>
        <div className={styles.input_row}>
          <Input
            value={input}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setInput(event.target.value)}
            placeholder={t("permission-placeholder")}
            aria-label={t("permission-placeholder")}
          />
          <Button
            variant="secondary"
            onClick={handleAdd}
            disabled={!input.trim()}
            title={t("add-permission")}
            aria-label={t("add-permission")}
          >
            {t("add-permission")}
          </Button>
        </div>
        <p className={styles.hint}>{t("permission-hint")}</p>
      </fieldset>

      <section className={styles.transfer}>
        <PermissionColumn
          title={t("available-permissions")}
          items={available}
          selected={left.selected}
          paint={left}
          placeholder={t("search-permissions")}
          emptyLabel={t("no-permissions-found")}
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
          title={t("assigned-permissions")}
          items={assigned}
          selected={right.selected}
          paint={right}
          placeholder={t("search-permissions")}
          emptyLabel={t("no-permissions-found")}
        />
      </section>
    </section>
  );
};

export default RolePermissionList;
