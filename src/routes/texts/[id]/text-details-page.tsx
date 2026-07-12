import { Suspense } from "react";
import { useParams } from "react-router-dom";
import TextDetailsContent from "~/components/texts/text-details-content";
import { TextDetailsPageSkeleton } from "~/components/texts/skeletons";
import styles from "./text-details-page.module.css";

/**
 * Text detail page.
 */
const TextDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;

  return (
    <Suspense fallback={<TextDetailsPageSkeleton />}>
      <TextDetailsContent textId={id} className={styles.content} />
    </Suspense>
  );
};

export default TextDetailsPage;
