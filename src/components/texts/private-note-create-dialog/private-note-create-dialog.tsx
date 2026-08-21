import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  MarkdownEditor,
} from "@sun/components";
import { createPrivateNote } from "~/server/actions/private-note";
import { centeredDialogPosition } from "~/utils/dialog-position";
import styles from "./private-note-create-dialog.module.css";

import type { AnnotationSelection } from "../annotation-create-dialog";

export type PrivateNoteCreateState = {
  /**
   * Whether the dialog is open.
   */
  open: boolean;
  /**
   * The selection being annotated, or null when closed.
   */
  selection: AnnotationSelection | null;
};

type PrivateNoteCreateDialogProps = {
  /**
   * The text being annotated.
   */
  textId: string;
  /**
   * Dialog open state and the selection being annotated.
   */
  create: PrivateNoteCreateState;
  /**
   * Called when the open state changes.
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Called when the reader cancels. When set (e.g. the dialog was opened from
   * the note list), the caller can return to that list instead of just
   * closing.
   */
  onCancel?: () => void;
  /**
   * Called with the new note ID after a successful create.
   */
  onCreated?: (noteId: string) => void;
};

/**
 * Draggable dialog for creating a private note on a selected text range.
 */
const PrivateNoteCreateDialog = (props: PrivateNoteCreateDialogProps) => {
  const { textId, create, onOpenChange, onCancel, onCreated } = props;
  const { t } = useTranslation("texts");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const { selection } = create;
  if (!selection) return null;

  const snippet =
    selection.selectedText.length > 60
      ? `${selection.selectedText.slice(0, 60)}…`
      : selection.selectedText;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    const { startOffset, endOffset } = selection;
    startTransition(async () => {
      setError(null);
      const result = await createPrivateNote({
        textId,
        startOffset,
        endOffset,
        body: trimmed,
      });
      if (result.__typename === "QuerySuccess") {
        setBody("");
        onOpenChange(false);
        if (result.id) {
          onCreated?.(result.id);
        } else {
          onCreated?.("");
        }
      } else {
        setError(t("private-note-error"));
      }
    });
  };

  return (
    <Dialog
      open={create.open}
      onOpenChange={onOpenChange}
      draggable
      position={centeredDialogPosition(
        { top: selection.bottom + 8, left: selection.left },
        24,
      )}
      className={styles.dialog}
    >
      <DialogHeader>
        <DialogTitle>{t("private-note-title", { snippet })}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Form id="create-private-note-form" onSubmit={handleSubmit}>
          <MarkdownEditor
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
              setBody(event.target.value)
            }
            placeholder={t("private-note-placeholder")}
            aria-label={t("private-note-placeholder")}
            rows={5}
          />
        </Form>
        {error && <p className={styles.error}>{error}</p>}
      </DialogBody>
      <DialogFooter>
        <Button
          variant="secondary"
          onClick={() => (onCancel ? onCancel() : onOpenChange(false))}
          title={t("cancel")}
          aria-label={t("cancel")}
        >
          {t("cancel")}
        </Button>
        <Button
          type="submit"
          form="create-private-note-form"
          disabled={pending || !body.trim()}
          title={t("private-note-create")}
          aria-label={t("private-note-create")}
        >
          {t("private-note-create")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default PrivateNoteCreateDialog;
