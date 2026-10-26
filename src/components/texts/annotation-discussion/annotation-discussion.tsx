import { Suspense, useEffect, useRef, useState, useTransition } from "react";
import { useTranslation } from "@sun/i18n";
import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
  Button,
  Form,
  MarkdownEditor,
} from "@sun/components";
import { makeCacheKey, patchPageData, revalidatePageData } from "@sun/ssr";
import { addComment } from "~/server/actions/annotation";
import type { ListAnnotationsQuery } from "~/generated/graphql";
import AnnotationReplies from "../annotation-replies";
import RepliesSkeleton from "./skeletons/replies-skeleton";
import styles from "./annotation-discussion.module.css";

type Annotation = ListAnnotationsQuery["hadesQueries"]["annotations"]["items"][number];

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
   * The owning text, used to update the annotation list on reply.
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
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const composerRef = useRef<HTMLDivElement>(null);

  /**
   * Focuses the editor when the composer opens.
   */
  useEffect(() => {
    if (composerOpen) {
      composerRef.current?.querySelector<HTMLElement>('[role="textbox"]')?.focus();
    }
  }, [composerOpen]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    startTransition(async () => {
      try {
        await addComment({
          annotationId,
          parentId: null,
          body: trimmed,
        });
        revalidatePageData([
          makeCacheKey("annotations/:annotationId", { annotationId }),
        ]);
        patchPageData<Annotation[]>("annotations", "texts/:id", { id: textId }, (current) =>
          (current ?? []).map((item) =>
            item.id === annotationId ? { ...item, replyCount: item.replyCount + 1 } : item,
          ),
        );
        setBody("");
        setResetKey((key) => key + 1);
        setRepliesOpen(true);
        onComposerOpenChange(false);
      } catch {
        return;
      }
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
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.currentTarget.value)}
              placeholder={t("comment-placeholder")}
              aria-label={t("comment-placeholder")}
              rows={3}
            />
          </div>
          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={() => onComposerOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={pending || !body.trim()}>
              {t("comment-action")}
            </Button>
          </div>
        </Form>
      )}
      {replyCount > 0 && (
        <Accordion open={repliesOpen} onOpenChange={setRepliesOpen}>
          <AccordionTrigger>{t("replies", { count: replyCount })}</AccordionTrigger>
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
