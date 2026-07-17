import { usePageData } from "@sun/ssr/react";
import type { ListCommentsQuery } from "~/generated/graphql";
import CommentItem from "../comment-item";
import styles from "./annotation-replies.module.css";

type Comment =
  ListCommentsQuery["hadesQueries"]["comments"]["items"][number];
type LevelColours = Record<string, string>;

type AnnotationRepliesProps = {
  /**
   * The annotation whose replies are listed.
   */
  annotationId: string;
  /**
   * The owning text, used to refresh reply counts after a delete.
   */
  textId: string;
};

/**
 * Reply list for an annotation. Reads page data on mount, so it is rendered
 * inside a Suspense boundary by its parent.
 */
const AnnotationReplies = ({ annotationId, textId }: AnnotationRepliesProps) => {
  const { data: comments } = usePageData<Comment[]>(
    "comments",
    "annotations/:annotationId",
    { annotationId },
  );
  const { data: colours } = usePageData<LevelColours | null>(
    "levelColours",
    "levelColours",
  );
  const items = comments ?? [];
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className={styles.list}>
      {items.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          profile={comment.authorProfile ?? undefined}
          colours={colours}
          annotationId={annotationId}
          textId={textId}
        />
      ))}
    </ul>
  );
};

export default AnnotationReplies;
