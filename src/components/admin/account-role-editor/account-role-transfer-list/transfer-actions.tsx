import { useTranslation } from "react-i18next";
import { Button } from "@sun/components";
import { ChevronRightIcon, ChevronLeftIcon, ChevronDoubleRightIcon, ChevronDoubleLeftIcon } from "@heroicons/react/24/outline";
import styles from "./account-role-transfer-list.module.css";

type TransferActionsProps = {
  /**
   * Whether available has selected.
   */
  hasSelectedAvailable: boolean;
  /**
   * Whether assigned has selected.
   */
  hasSelectedAssigned: boolean;
  /**
   * Whether filtered available has items.
   */
  hasFilteredAvailable: boolean;
  /**
   * Whether filtered assigned has items.
   */
  hasFilteredAssigned: boolean;
  /**
   * Move selected to assigned.
   */
  onMoveSelectedToAssigned: () => void;
  /**
   * Move selected to available.
   */
  onMoveSelectedToAvailable: () => void;
  /**
   * Move all to assigned.
   */
  onMoveAllToAssigned: () => void;
  /**
   * Move all to available.
   */
  onMoveAllToAvailable: () => void;
} & React.HTMLAttributes<HTMLElement>;

/**
 * Center actions for transfer.
 */
const TransferActions = (props: TransferActionsProps) => {
  const {
    hasSelectedAvailable,
    hasSelectedAssigned,
    hasFilteredAvailable,
    hasFilteredAssigned,
    onMoveSelectedToAssigned,
    onMoveSelectedToAvailable,
    onMoveAllToAssigned,
    onMoveAllToAvailable,
    className,
    ...rest
  } = props;
  const { t } = useTranslation("admin");

  return (
    <section className={styles.actions} aria-label={t("transfer-actions")} {...rest}>
      <Button
        variant="secondary"
        title={t("move-selected-to-assigned")}
        aria-label={t("move-selected-to-assigned")}
        onClick={onMoveSelectedToAssigned}
        disabled={!hasSelectedAvailable}
      >
        <ChevronRightIcon width={16} height={16} />
      </Button>
      <Button
        variant="secondary"
        title={t("move-selected-to-available")}
        aria-label={t("move-selected-to-available")}
        onClick={onMoveSelectedToAvailable}
        disabled={!hasSelectedAssigned}
      >
        <ChevronLeftIcon width={16} height={16} />
      </Button>
      <Button
        variant="secondary"
        title={t("move-all-to-assigned")}
        aria-label={t("move-all-to-assigned")}
        onClick={onMoveAllToAssigned}
        disabled={!hasFilteredAvailable}
      >
        <ChevronDoubleRightIcon width={16} height={16} />
      </Button>
      <Button
        variant="secondary"
        title={t("move-all-to-available")}
        aria-label={t("move-all-to-available")}
        onClick={onMoveAllToAvailable}
        disabled={!hasFilteredAssigned}
      >
        <ChevronDoubleLeftIcon width={16} height={16} />
      </Button>
    </section>
  );
};

export default TransferActions;
