import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@sun/components";

type ConfirmSuspendAccountDialogProps = {
  /**
   * Whether the dialog is open.
   */
  open: boolean;
  /**
   * Callback to close the dialog without confirming.
   */
  onClose: () => void;
  /**
   * Callback to fire the suspend mutation.
   */
  onConfirm: () => void;
  /**
   * Username of the account being suspended.
   */
  username: string;
};

/**
 * Confirmation dialog for suspending an account.
 */
const ConfirmSuspendAccountDialog = ({
  open,
  onClose,
  onConfirm,
  username,
}: ConfirmSuspendAccountDialogProps) => {
  const { t } = useTranslation("admin");

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <DialogHeader>
        <DialogTitle>{t("suspend-title", { username })}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <p>{t("suspend-body")}</p>
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onClose}>
          {t("cancel-label")}
        </Button>
        <Button type="submit" variant="destructive" onClick={onConfirm}>
          {t("confirm-label")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ConfirmSuspendAccountDialog;
