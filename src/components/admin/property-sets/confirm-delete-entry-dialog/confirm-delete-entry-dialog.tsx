import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@sun/components";

type ConfirmDeleteEntryDialogProps = {
  /**
   * Whether the dialog is open.
   */
  open: boolean;
  /**
   * Callback to close the dialog without confirming.
   */
  onClose: () => void;
  /**
   * Callback to fire the delete mutation.
   */
  onConfirm: () => void;
  /**
   * Entry name being deleted.
   */
  entryName: string;
};

/**
 * Confirmation dialog for deleting a property-set entry.
 */
const ConfirmDeleteEntryDialog = (props: ConfirmDeleteEntryDialogProps) => {
  const { open, onClose, onConfirm, entryName } = props;
  const { t } = useTranslation("admin");

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <DialogHeader>
        <DialogTitle>{t("delete-entry-title", { entryName })}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <p>{t("delete-entry-body", { entryName })}</p>
      </DialogBody>
      <DialogFooter>
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          title={t("cancel-label")}
          aria-label={t("cancel-label")}
        >
          {t("cancel-label")}
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={onConfirm}
          title={t("confirm-label")}
          aria-label={t("confirm-label")}
        >
          {t("confirm-label")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ConfirmDeleteEntryDialog;
