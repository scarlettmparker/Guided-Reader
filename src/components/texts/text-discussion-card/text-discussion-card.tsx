import { Suspense, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Form,
  MarkdownEditor,
} from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import { createPost, createThread } from "~/server/actions/forum";
import type { ThreadsForQuery } from "~/generated/graphql";
import ThreadPosts from "../thread-posts";
import styles from "./text-discussion-card.module.css";

type Thread =
  ThreadsForQuery["icarusQueries"]["threadsFor"]["items"][number];

/**
 * Title stored on the single thread backing a text discussion. Never shown to
 * readers; the thread exists only to group the text's posts.
 */
const THREAD_TITLE = "Text discussion";

type TextDiscussionCardProps = {
  /**
   * The text whose discussion is shown.
   */
  textId: string;
};

/**
 * Flat discussion for a text: existing posts and a composer, rendered below
 * the text. The backing thread is created on first post, so readers never see
 * or manage thread titles.
 */
const TextDiscussionCard = ({ textId }: TextDiscussionCardProps) => {
  const { t } = useTranslation("texts");
  const { data: threads } = usePageData<Thread[]>(
    "threads",
    "texts/:id/discussion",
    { id: textId },
  );
  const [body, setBody] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [pending, startTransition] = useTransition();
  const threadId = threads?.[0]?.id;

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    startTransition(async () => {
      let id: string | undefined = threadId;
      if (!id) {
        const created = await createThread(
          { title: THREAD_TITLE, remoteObject: `hades:text:${textId}` },
          textId,
        );
        if (created.__typename === "QuerySuccess") {
          id = created.id ?? undefined;
        }
      }
      if (!id) return;
      const result = await createPost(
        { threadId: id, parentId: null, body: trimmed },
        textId,
      );
      if (result.__typename !== "QuerySuccess") return;
      setBody("");
      setResetKey((k) => k + 1);
    });
  };

  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle>{t("text-discussion")}</CardTitle>
      </CardHeader>
      <CardBody>
        <Suspense fallback={null}>
          {threadId && <ThreadPosts threadId={threadId} />}
        </Suspense>
        <Form onSubmit={submit} className={styles.composer}>
          <MarkdownEditor
            key={resetKey}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setBody(e.target.value)
            }
            placeholder={t("comment-placeholder")}
            aria-label={t("comment-placeholder")}
            rows={3}
          />
          <div className={styles.actions}>
            <Button type="submit" disabled={pending || !body.trim()}>
              {t("comment-action")}
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};

export default TextDiscussionCard;
