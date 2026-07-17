import { Suspense, useEffect, useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
  Button,
  Form,
  MarkdownEditor,
} from "@sun/components";
import { addComment } from "~/server/actions/annotation";
import AnnotationReplies from "../annotation-replies";
import RepliesSkeleton from "./skeletons/replies-skeleton";
import styles from "./annotation-discussion.module.css";

type AnnotationDiscussionProps = {
  /**
   * The annotation whose replies are shown.
   */
  annotationId: string;
  /**
   * Number of replies, from the annotation.
   */
  replyCount: number;
  /**
   * The owning text, used to invalidate the annotation list on reply.
   */
  textId: string;
  /**
   * Whether the accordion is open.
   */
  open: boolean;
  /**
   * Called when the open state changes.
   */
  onOpenChange: (open: boolean) => void;
};

/**
 * Reply accordion for a single annotation. The composer sits at the top of the
 * accordion content and replies load below it; both appear only while open.
 */
const AnnotationDiscussion = ({
  annotationId,
  replyCount,
  textId,
  open,
  onOpenChange,
}: AnnotationDiscussionProps) => {
  const { t } = useTranslation("texts");
  const [body, setBody] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [pending, startTransition] = useTransition();
  const composerRef = useRef<HTMLDivElement>(null);

  /**
   * Focuses the editor when the accordion opens.
   */
  useEffect(() => {
    if (open) {
      composerRef.current
        ?.querySelector<HTMLElement>('[role="textbox"]')
        ?.focus();
    }
  }, [open]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const result = await addComment(
        { annotationId, parentId: null, body: trimmed },
        textId,
      );
      if (result.__typename !== "QuerySuccess") return;
      setBody("");
      setResetKey((key) => key + 1);
    });
  };

  if (replyCount === 0 && !open) {
    return null;
  }

  return (
    <Accordion open={open} onOpenChange={onOpenChange}>
      <AccordionTrigger>
        {replyCount > 0
          ? t("replies", { count: replyCount })
          : t("reply-action")}
      </AccordionTrigger>
      <AccordionContent>
        <Form onSubmit={submit} className={styles.composer}>
          <div ref={composerRef}>
            <MarkdownEditor
              key={resetKey}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setBody(e.target.value)
              }
              placeholder={t("comment-placeholder")}
              aria-label={t("comment-placeholder")}
              rows={3}
            />
          </div>
          <div className={styles.actions}>
            <Button type="submit" disabled={pending || !body.trim()}>
              {t("comment-action")}
            </Button>
          </div>
        </Form>
        {replyCount > 0 && (
          <Suspense fallback={<RepliesSkeleton count={replyCount} />}>
            <AnnotationReplies annotationId={annotationId} textId={textId} />
          </Suspense>
        )}
      </AccordionContent>
    </Accordion>
  );
};

export default AnnotationDiscussion;
