import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@sun/components";

type ConfirmUnsuspendAccountDialogProps = {
  /**
   * Whether the dialog is open.
   */
  open: boolean;
  /**
   * Callback to close the dialog without confirming.
   */
  onClose: () => void;
  /**
   * Callback to fire the unsuspend mutation.
   */
  onConfirm: () => void;
  /**
   * Username of the account being unsuspended.
   */
  username: string;
};

/**
 * Confirmation dialog for unsuspending an account.
 */
const ConfirmUnsuspendAccountDialog = ({
  open,
  onClose,
  onConfirm,
  username,
}: ConfirmUnsuspendAccountDialogProps) => {
  const { t } = useTranslation("admin");

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <DialogHeader>
        <DialogTitle>{t("unsuspend-title", { username })}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <p>{t("unsuspend-body")}</p>
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onClose}>
          {t("cancel-label")}
        </Button>
        <Button type="submit" variant="default" onClick={onConfirm}>
          {t("confirm-label")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ConfirmUnsuspendAccountDialog;
