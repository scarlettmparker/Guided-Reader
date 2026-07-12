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
};

/**
 * Draggable dialog for creating an annotation on a selected text range.
 */
const AnnotationCreateDialog = ({
  textId,
  create,
  onOpenChange,
}: AnnotationCreateDialogProps) => {
  const { t } = useTranslation("texts");
  const [body, setBody] = useState("");
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
      const result = await createAnnotation({
        textId,
        startOffset,
        endOffset,
        body: trimmed,
      });
      if (result.__typename === "QuerySuccess") {
        setBody("");
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog
      open={create.open}
      onOpenChange={onOpenChange}
      draggable
      position={{ top: selection.top, left: selection.left }}
      className={styles.dialog}
    >
      <Form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>
            {t("annotate-prefix")} &ldquo;{snippet}&rdquo;
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <MarkdownEditor
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setBody(e.target.value)
            }
            placeholder={t("annotation-placeholder")}
            aria-label={t("annotation-placeholder")}
            rows={5}
          />
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            {t("cancel")}
          </Button>
          <Button type="submit" disabled={pending || !body.trim()}>
            {t("annotate")}
          </Button>
        </DialogFooter>
      </Form>
    </Dialog>
  );
};

export default AnnotationCreateDialog;
