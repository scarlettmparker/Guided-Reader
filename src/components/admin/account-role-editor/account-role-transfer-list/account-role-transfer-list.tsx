import { useTranslation } from "react-i18next";
import { cn } from "@sun/components";
import type { RolesQuery } from "~/generated/graphql";
import { useRoleTransfer } from "./use-role-transfer";
import RoleColumn from "./role-column";
import TransferActions from "./transfer-actions";
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
  const {
    filteredAvailable,
    filteredAssigned,
    availableQuery,
    setAvailableQuery,
    assignedQuery,
    setAssignedQuery,
    selectedAvailable,
    selectedAssigned,
    available,
    assigned,
    onAvailableMouseDown,
    onAvailableMouseEnter,
    onAssignedMouseDown,
    onAssignedMouseEnter,
    moveSelectedToAssigned,
    moveSelectedToAvailable,
    moveAllToAssigned,
    moveAllToAvailable,
    handleDragStartAvailable,
    handleDragStartAssigned,
    handleDropToAssigned,
    handleDropToAvailable,
  } = useRoleTransfer(roles, assignedRoleNames, onChange);

  return (
    <section className={cn(styles.transfer, className)} {...rest}>
      <RoleColumn
        title={t("available-roles")}
        count={available.length}
        placeholder={t("search-roles")}
        query={availableQuery}
        onQueryChange={setAvailableQuery}
        onSearch={setAvailableQuery}
        items={filteredAvailable}
        selected={selectedAvailable}
        emptyLabel={t("no-roles-found")}
        onDragStart={handleDragStartAvailable}
        onMouseDown={onAvailableMouseDown}
        onMouseEnter={onAvailableMouseEnter}
        onDrop={handleDropToAvailable}
      />
      <TransferActions
        hasSelectedAvailable={selectedAvailable.size > 0}
        hasSelectedAssigned={selectedAssigned.size > 0}
        hasFilteredAvailable={filteredAvailable.length > 0}
        hasFilteredAssigned={filteredAssigned.length > 0}
        onMoveSelectedToAssigned={moveSelectedToAssigned}
        onMoveSelectedToAvailable={moveSelectedToAvailable}
        onMoveAllToAssigned={moveAllToAssigned}
        onMoveAllToAvailable={moveAllToAvailable}
      />
      <RoleColumn
        title={t("assigned-roles")}
        count={assigned.length}
        placeholder={t("search-roles")}
        query={assignedQuery}
        onQueryChange={setAssignedQuery}
        onSearch={setAssignedQuery}
        items={filteredAssigned}
        selected={selectedAssigned}
        emptyLabel={t("no-roles-found")}
        onDragStart={handleDragStartAssigned}
        onMouseDown={onAssignedMouseDown}
        onMouseEnter={onAssignedMouseEnter}
        onDrop={handleDropToAssigned}
      />
    </section>
  );
};

export default AccountRoleTransferList;
