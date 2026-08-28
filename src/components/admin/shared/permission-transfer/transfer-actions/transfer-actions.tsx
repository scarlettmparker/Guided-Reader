import { useTranslation } from "react-i18next";
import { Button, cn } from "@sun/components";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronDoubleRightIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/outline";
import styles from "./transfer-actions.module.css";

type TransferActionsProps = {
  /**
   * Left side state and handlers.
   */
  left: {
    hasSelected: boolean;
    hasItems: boolean;
    onMoveSelected: () => void;
    onMoveAll: () => void;
  };
  /**
   * Right side state and handlers.
   */
  right: {
    hasSelected: boolean;
    hasItems: boolean;
    onMoveSelected: () => void;
    onMoveAll: () => void;
  };
} & React.HTMLAttributes<HTMLElement>;

/**
 * Center actions for transfer.
 */
const TransferActions = (props: TransferActionsProps) => {
  const { left, right, className, ...rest } = props;
  const { t } = useTranslation("admin");

  return (
    <section
      className={cn(styles.actions, className)}
      aria-label={t("transfer-actions")}
      {...rest}
    >
      <Button
        variant="secondary"
        title={t("move-selected-to-assigned")}
        aria-label={t("move-selected-to-assigned")}
        onClick={left.onMoveSelected}
        disabled={!left.hasSelected}
      >
        <ChevronRightIcon width={16} height={16} />
      </Button>
      <Button
        variant="secondary"
        title={t("move-selected-to-available")}
        aria-label={t("move-selected-to-available")}
        onClick={right.onMoveSelected}
        disabled={!right.hasSelected}
      >
        <ChevronLeftIcon width={16} height={16} />
      </Button>
      <Button
        variant="secondary"
        title={t("move-all-to-assigned")}
        aria-label={t("move-all-to-assigned")}
        onClick={left.onMoveAll}
        disabled={!left.hasItems}
      >
        <ChevronDoubleRightIcon width={16} height={16} />
      </Button>
      <Button
        variant="secondary"
        title={t("move-all-to-available")}
        aria-label={t("move-all-to-available")}
        onClick={right.onMoveAll}
        disabled={!right.hasItems}
      >
        <ChevronDoubleLeftIcon width={16} height={16} />
      </Button>
    </section>
  );
};

export default TransferActions;
