import { useTransition } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@sun/components";

type ConfirmDeactivateAccountDialogProps = {
  /**
   * Whether the dialog is open.
   */
  open: boolean;
  /**
   * Callback to close the dialog without confirming.
   */
  onClose: () => void;
  /**
   * Callback to fire the deactivate mutation.
   */
  onConfirm: () => Promise<void>;
  /**
   * Display name of the account being deactivated.
   */
  username: string;
};

/**
 * Confirmation dialog for deactivating the calling account.
 */
const ConfirmDeactivateAccountDialog = ({
  open,
  onClose,
  onConfirm,
  username,
}: ConfirmDeactivateAccountDialogProps) => {
  const { t } = useTranslation("profile");
  const [pending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await onConfirm();
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o: boolean) => {
        if (!o && !pending) onClose();
      }}
    >
      <DialogHeader>
        <DialogTitle>{t("deactivate-title", { username })}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <p>{t("deactivate-body")}</p>
      </DialogBody>
      <DialogFooter>
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={pending}
        >
          {t("cancel-label")}
        </Button>
        <Button
          type="submit"
          variant="destructive"
          onClick={handleConfirm}
          disabled={pending}
        >
          {t("confirm-label")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ConfirmDeactivateAccountDialog;
