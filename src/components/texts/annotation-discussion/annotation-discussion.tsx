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
   * Whether the reply composer is open.
   */
  composerOpen: boolean;
  /**
   * Called when the composer open state changes.
   */
  onComposerOpenChange: (open: boolean) => void;
};

/**
 * Reply composer and reply list for a single annotation. The composer opens
 * only from the reply action and is closed by its cancel button; replies load
 * lazily behind their own accordion.
 */
const AnnotationDiscussion = ({
  annotationId,
  replyCount,
  textId,
  composerOpen,
  onComposerOpenChange,
}: AnnotationDiscussionProps) => {
  const { t } = useTranslation("texts");
  const [body, setBody] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [pending, startTransition] = useTransition();
  const composerRef = useRef<HTMLDivElement>(null);

  /**
   * Focuses the editor when the composer opens.
   */
  useEffect(() => {
    if (composerOpen) {
      composerRef.current
        ?.querySelector<HTMLElement>('[role="textbox"]')
        ?.focus();
    }
  }, [composerOpen]);

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
      onComposerOpenChange(false);
    });
  };

  if (replyCount === 0 && !composerOpen) {
    return null;
  }

  return (
    <div className={styles.discussion}>
      {composerOpen && (
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
            <Button
              type="button"
              variant="secondary"
              onClick={() => onComposerOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={pending || !body.trim()}>
              {t("comment-action")}
            </Button>
          </div>
        </Form>
      )}
      {replyCount > 0 && (
        <Accordion defaultOpen={false}>
          <AccordionTrigger>
            {t("replies", { count: replyCount })}
          </AccordionTrigger>
          <AccordionContent>
            <Suspense fallback={<RepliesSkeleton count={replyCount} />}>
              <AnnotationReplies annotationId={annotationId} textId={textId} />
            </Suspense>
          </AccordionContent>
        </Accordion>
      )}
    </div>
  );
};

export default AnnotationDiscussion;
