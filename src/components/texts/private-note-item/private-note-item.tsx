import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@sun/components";
import { deletePrivateNote } from "~/server/actions/private-note";
import styles from "./private-note-item.module.css";

type PrivateNoteItemProps = {
  /**
   * Note id.
   */
  id: string;
  /**
   * Note body.
   */
  body: string;
  /**
   * Text id for invalidation.
   */
  textId: string;
  /**
   * Whether the current user is the owner.
   */
  isOwner: boolean;
} & React.HTMLAttributes<HTMLLIElement>;

/**
 * Renders a single private note with delete action.
 */
const PrivateNoteItem = (props: PrivateNoteItemProps) => {
  const { id, body, textId, isOwner, ...rest } = props;
  const { t } = useTranslation("texts");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deletePrivateNote(id, textId);
      setConfirmOpen(false);
    });
  };

  return (
    <li className={styles.item} {...rest}>
      <p className={styles.body}>{body}</p>
      {isOwner && (
        <Button
          variant="secondary"
          onClick={() => setConfirmOpen(true)}
          title={t("delete")}
          aria-label={t("delete")}
        >
          {t("delete")}
        </Button>
      )}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogHeader>
          <DialogTitle>{t("delete-private-note-title")}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p>{t("delete-private-note-body")}</p>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => setConfirmOpen(false)}
            title={t("cancel")}
            aria-label={t("cancel")}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleDelete}
            disabled={pending}
            title={t("delete")}
            aria-label={t("delete")}
          >
            {t("delete")}
          </Button>
        </DialogFooter>
      </Dialog>
    </li>
  );
};

export default PrivateNoteItem;
