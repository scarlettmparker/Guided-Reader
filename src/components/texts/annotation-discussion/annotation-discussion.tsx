import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
  Button,
  Form,
  MarkdownEditor,
} from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import { addComment } from "~/server/actions/annotation";
import type { ListCommentsQuery } from "~/generated/graphql";
import CommentItem from "../comment-item";
import styles from "./annotation-discussion.module.css";

type Comment = ListCommentsQuery["hadesQueries"]["comments"]["items"][number];

type LevelColours = Record<string, string>;

type AnnotationDiscussionProps = {
  /**
   * The annotation whose comments are shown.
   */
  annotationId: string;
};

/**
 * Collapsible reply thread and composer for a single annotation.
 */
const AnnotationDiscussion = ({ annotationId }: AnnotationDiscussionProps) => {
  const { t } = useTranslation("texts");
  const { data: comments } = usePageData<Comment[]>(
    "comments",
    "annotations/:annotationId",
    { annotationId },
  );
  const { data: colours } = usePageData<LevelColours | null>(
    "levelColours",
    "levelColours",
  );
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const items = comments ?? [];

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await addComment({
        annotationId,
        parentId: null,
        body: trimmed,
      });
      setBody("");
    });
  };

  return (
    <Accordion className={styles.discussion}>
      <AccordionTrigger>
        {t("replies", { count: items.length })}
      </AccordionTrigger>
      <AccordionContent>
        {items.length === 0 ? (
          <p className={styles.empty}>{t("comment-placeholder")}</p>
        ) : (
          <ul className={styles.list}>
            {items.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                profile={comment.authorProfile ?? undefined}
                colours={colours}
              />
            ))}
          </ul>
        )}
        <Form onSubmit={submit} className={styles.composer}>
          <MarkdownEditor
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setBody(e.target.value)
            }
            placeholder={t("comment-placeholder")}
            aria-label={t("comment-placeholder")}
            rows={3}
          />
          <Button type="submit" variant="secondary" disabled={pending || !body.trim()}>
            {t("suggest-improvement")}
          </Button>
        </Form>
      </AccordionContent>
    </Accordion>
  );
};

export default AnnotationDiscussion;
