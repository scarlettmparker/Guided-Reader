import { useTransition } from "react";
import { useTranslation } from "@sun/i18n";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@sun/components";
import { patchPageData } from "@sun/ssr";
import { deleteAnnotation } from "~/server/actions/annotation";
import type { ListAnnotationsQuery } from "~/generated/graphql";

type Annotation =
  ListAnnotationsQuery["hadesQueries"]["annotations"]["items"][number];

type AnnotationConfirmDeleteDialogProps = {
  /**
   * The annotation to delete, or null when the dialog is closed.
   */
  target: Annotation | null;
  /**
   * Called when the open state changes.
   */
  onOpenChange: (open: boolean) => void;
  /**
   * The text the annotation belongs to.
   */
  textId: string;
};

/** Confirmation dialog for deleting an annotation. */
const AnnotationConfirmDeleteDialog = ({
  target,
  onOpenChange,
  textId,
}: AnnotationConfirmDeleteDialogProps) => {
  const { t } = useTranslation("texts");
  const [pending, startTransition] = useTransition();

  if (!target) return null;

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        const response = await deleteAnnotation(target.id);
        patchPageData<Annotation[]>(
          "annotations",
          "texts/:id",
          { id: textId },
          (current) =>
            (current ?? []).filter((item) => item.id !== response.id),
        );
      } finally {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={!!target} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{t("delete-annotation-title")}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <p>{t("delete-annotation-body", { snippet: target.body })}</p>
      </DialogBody>
      <DialogFooter>
        <Button
          type="button"
          variant="secondary"
          onClick={() => onOpenChange(false)}
        >
          {t("cancel")}
        </Button>
        <Button
          type="button"
          variant="destructive"
          disabled={pending}
          onClick={handleConfirm}
        >
          {t("delete")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default AnnotationConfirmDeleteDialog;
