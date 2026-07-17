import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Form,
  Input,
} from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import { createThread } from "~/server/actions/forum";
import type { ThreadsForQuery } from "~/generated/graphql";
import ThreadPosts from "../thread-posts";
import styles from "./text-discussion-card.module.css";

type Thread = ThreadsForQuery["icarusQueries"]["threadsFor"]["items"][number];

type TextDiscussionCardProps = {
  /**
   * The text whose discussion is shown.
   */
  textId: string;
};

/**
 * Text-level discussion: a sibling card listing forum threads for a text, each
 * expanding to its posts and a reply composer.
 */
const TextDiscussionCard = ({ textId }: TextDiscussionCardProps) => {
  const { t } = useTranslation("texts");
  const { data: threads } = usePageData<Thread[]>(
    "threads",
    "texts/:id/discussion",
    { id: textId },
  );
  const [title, setTitle] = useState("");
  const [pending, startTransition] = useTransition();
  const items = threads ?? [];

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await createThread(
        { title: trimmed, remoteObject: `hades:text:${textId}` },
        textId,
      );
      setTitle("");
    });
  };

  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle>{t("text-discussion")}</CardTitle>
      </CardHeader>
      <CardBody>
        {items.length === 0 ? (
          <p className={styles.empty}>{t("start-thread")}</p>
        ) : (
          <div className={styles.threads}>
            {items.map((thread) => (
              <Accordion key={thread.id}>
                <AccordionTrigger>{thread.title}</AccordionTrigger>
                <AccordionContent>
                  <ThreadPosts threadId={thread.id} textId={textId} />
                </AccordionContent>
              </Accordion>
            ))}
          </div>
        )}
        <Form onSubmit={submit} className={styles.composer}>
          <Input
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTitle(e.target.value)
            }
            placeholder={t("thread-title-placeholder")}
            aria-label={t("thread-title-placeholder")}
          />
          <Button type="submit" disabled={pending || !title.trim()}>
            {t("start-thread")}
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
};

export default TextDiscussionCard;
