import { Suspense } from "react";
import { useOutlet, useParams } from "react-router-dom";
import TextList from "~/components/texts/text-list";
import TextDetailPlaceholder from "~/components/texts/text-detail-placeholder";
import TextDiscussionCard from "~/components/texts/text-discussion-card";
import { TextsPageSkeleton } from "~/components/texts/skeletons";
import styles from "./texts-page.module.css";

/**
 * Two-panel texts page: list with filters on the left, text detail on the
 * right. The text-level discussion sits below the detail when a text is open.
 */
const TextsPage = () => {
  const outlet = useOutlet();
  const { id } = useParams<{ id: string }>();

  return (
    <div className={styles.layout}>
      <div className={styles.list_panel}>
        <Suspense fallback={<TextsPageSkeleton />}>
          <TextList />
        </Suspense>
      </div>
      <div className={styles.detail_column}>
        <div className={styles.detail_panel}>
          {outlet ?? <TextDetailPlaceholder />}
        </div>
        {id && (
          <Suspense fallback={null}>
            <TextDiscussionCard textId={id} />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default TextsPage;
