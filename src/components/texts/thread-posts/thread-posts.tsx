import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { Button, Form, MarkdownEditor } from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import { createPost } from "~/server/actions/forum";
import type { ListPostsQuery } from "~/generated/graphql";
import ForumPostItem from "../forum-post-item";
import styles from "./thread-posts.module.css";

type Post = ListPostsQuery["icarusQueries"]["posts"]["items"][number];

type LevelColours = Record<string, string>;

type ThreadPostsProps = {
  /**
   * The thread whose posts are shown.
   */
  threadId: string;
  /**
   * The owning text id, for cache invalidation of the thread list.
   */
  textId: string;
};

/**
 * The posts and reply composer for a single discussion thread.
 */
const ThreadPosts = ({ threadId, textId }: ThreadPostsProps) => {
  const { t } = useTranslation("texts");
  const { data: posts } = usePageData<Post[]>(
    "posts",
    "threads/:threadId",
    { threadId },
  );
  const { data: colours } = usePageData<LevelColours | null>(
    "levelColours",
    "levelColours",
  );
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const items = posts ?? [];

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await createPost({ threadId, parentId: null, body: trimmed }, textId);
      setBody("");
    });
  };

  return (
    <div>
      <ul className={styles.list}>
        {items.map((post) => (
          <ForumPostItem
            key={post.id}
            post={post}
            profile={post.authorProfile ?? undefined}
            colours={colours}
          />
        ))}
      </ul>
      <Form onSubmit={submit} className={styles.composer}>
        <MarkdownEditor
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setBody(e.target.value)
          }
          placeholder={t("post-placeholder")}
          aria-label={t("post-placeholder")}
          rows={3}
        />
        <Button type="submit" variant="secondary" disabled={pending || !body.trim()}>
          {t("reply")}
        </Button>
      </Form>
    </div>
  );
};

export default ThreadPosts;
