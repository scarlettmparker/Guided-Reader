import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  MarkdownViewer,
} from "@sun/components";
import { deletePrivateNote } from "~/server/actions/private-note";
import styles from "./private-note-list-dialog.module.css";

import type { PrivateNotesQuery } from "~/generated/graphql";

type PrivateNote =
  PrivateNotesQuery["hadesQueries"]["privateNotes"]["items"][number];

const TITLE_SNIPPET_LIMIT = 60;

/**
 * Dialog state for a single private note.
 */
export type PrivateNoteListState = {
  /**
   * Whether the dialog is open.
   */
  open: boolean;
  /**
   * Initial screen position for the draggable dialog.
   */
  position: { top: number; left: number };
  /**
   * The text the note belongs to.
   */
  textId: string;
  /**
   * The note being viewed.
   */
  noteId: string;
  /**
   * The annotated text snippet.
   */
  snippet: string;
};

type PrivateNoteListDialogProps = {
  /**
   * Dialog open state and the note being viewed.
   */
  list: PrivateNoteListState;
  /**
   * The live note for the position.
   */
  note?: PrivateNote;
  /**
   * Called when the open state changes.
   */
  onOpenChange: (open: boolean) => void;
};

/**
 * Draggable dialog showing a single private note.
 */
const PrivateNoteListDialog = ({
  list,
  note,
  onOpenChange,
}: PrivateNoteListDialogProps) => {
  const { t } = useTranslation("texts");
  const { open, position, snippet, noteId, textId } = list;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const titleSnippet =
    snippet.length > TITLE_SNIPPET_LIMIT
      ? `${snippet.slice(0, TITLE_SNIPPET_LIMIT)}…`
      : snippet;

  if (!note) {
    return (
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        draggable
        position={position}
      >
        <DialogHeader>
          <DialogTitle>
            {t("private-note-title", { snippet: titleSnippet })}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p>{t("not-found")}</p>
        </DialogBody>
      </Dialog>
    );
  }

  const handleDelete = () => {
    startTransition(async () => {
      await deletePrivateNote(noteId, textId);
      setConfirmOpen(false);
      onOpenChange(false);
    });
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        draggable
        position={position}
      >
        <DialogHeader>
          <DialogTitle>
            {t("private-note-title", { snippet: titleSnippet })}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <MarkdownViewer className={styles.body}>{note.body}</MarkdownViewer>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => setConfirmOpen(true)}
            title={t("delete")}
            aria-label={t("delete")}
          >
            {t("delete")}
          </Button>
        </DialogFooter>
      </Dialog>

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
    </>
  );
};

export default PrivateNoteListDialog;
