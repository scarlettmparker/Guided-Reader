import { usePageData } from "@sun/ssr/react";
import type { ListPostsQuery } from "~/generated/graphql";
import ForumPostItem from "../forum-post-item";
import styles from "./thread-posts.module.css";

type Post = ListPostsQuery["icarusQueries"]["posts"]["items"][number];

type ThreadPostsProps = {
  /**
   * Thread whose posts are listed.
   */
  threadId: string;
};

/**
 * Flat list of posts in a text discussion thread.
 */
const ThreadPosts = ({ threadId }: ThreadPostsProps) => {
  const { data: posts } = usePageData<Post[]>("posts", "threads/:threadId", {
    threadId,
  });
  const items = posts ?? [];
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className={styles.list}>
      {items.map((post) => (
        <ForumPostItem
          key={post.id}
          post={post}
          profile={post.authorProfile ?? undefined}
          threadId={threadId}
        />
      ))}
    </ul>
  );
};

export default ThreadPosts;
