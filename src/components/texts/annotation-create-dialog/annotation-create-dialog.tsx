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
import { createAnnotation } from "~/server/actions/annotation";
import { centeredDialogPosition } from "~/utils/dialog-position";
import styles from "./annotation-create-dialog.module.css";

const TITLE_SNIPPET_LIMIT = 60;

/**
 * A text selection to annotate.
 */
export type AnnotationSelection = {
  /**
   * Viewport Y of the selection's upper edge.
   */
  top: number;
  /**
   * Viewport Y of the selection's lower edge.
   */
  bottom: number;
  /**
   * Viewport X of the selection's horizontal centre.
   */
  left: number;
  /**
   * The trimmed selected text snippet.
   */
  selectedText: string;
  /**
   * Character offset of the selection start.
   */
  startOffset: number;
  /**
   * Character offset of the selection end.
   */
  endOffset: number;
};

/**
 * Create-dialog state owned by the annotation layer.
 */
export type AnnotationCreateState = {
  /**
   * Whether the dialog is open.
   */
  open: boolean;
  /**
   * The selection being annotated, or null when closed.
   */
  selection: AnnotationSelection | null;
};

type AnnotationCreateDialogProps = {
  /**
   * The text being annotated.
   */
  textId: string;
  /**
   * Dialog open state and the selection being annotated.
   */
  create: AnnotationCreateState;
  /**
   * Called when the open state changes.
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Called when the reader cancels. When set (e.g. the dialog was opened from
   * the annotation list), the caller can return to that list instead of just
   * closing.
   */
  onCancel?: () => void;
};

/**
 * Draggable dialog for creating an annotation on a selected text range.
 */
const AnnotationCreateDialog = ({
  textId,
  create,
  onOpenChange,
  onCancel,
}: AnnotationCreateDialogProps) => {
  const { t } = useTranslation("texts");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const { selection } = create;
  if (!selection) return null;

  const snippet =
    selection.selectedText.length > TITLE_SNIPPET_LIMIT
      ? `${selection.selectedText.slice(0, TITLE_SNIPPET_LIMIT)}…`
      : selection.selectedText;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    const { startOffset, endOffset } = selection;
    startTransition(async () => {
      setError(null);
      const result = await createAnnotation({
        textId,
        startOffset,
        endOffset,
        body: trimmed,
      });
      if (result.__typename === "QuerySuccess") {
        setBody("");
        onOpenChange(false);
      } else if (
        result.__typename === "StandardError" &&
        (result.message.includes("429") || result.message === "rate_limited")
      ) {
        setError(t("rate-limit-message"));
      } else {
        setError(t("annotation-error"));
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
        <DialogTitle>
          {t("annotate-prefix")} &ldquo;{snippet}&rdquo;
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Form id="create-annotation-form" onSubmit={handleSubmit}>
          <MarkdownEditor
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setBody(e.target.value)
            }
            placeholder={t("annotation-placeholder")}
            aria-label={t("annotation-placeholder")}
            rows={5}
          />
        </Form>
        {error && <p className={styles.error}>{error}</p>}
      </DialogBody>
      <DialogFooter>
        <Button
          type="button"
          variant="secondary"
          onClick={() => (onCancel ? onCancel() : onOpenChange(false))}
        >
          {t("cancel")}
        </Button>
        <Button type="submit" form="create-annotation-form" disabled={pending || !body.trim()}>
          {t("annotate")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default AnnotationCreateDialog;
