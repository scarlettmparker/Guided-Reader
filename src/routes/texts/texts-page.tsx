import { Suspense } from "react";
import { useOutlet } from "react-router-dom";
import TextList from "~/components/texts/text-list";
import TextDetailPlaceholder from "~/components/texts/text-detail-placeholder";
import { TextsPageSkeleton, TextDetailsPageSkeleton } from "~/components/texts/skeletons";
import styles from "./texts-page.module.css";

/**
 * Two-panel texts page: list with filters on the left, text detail on the right.
 */
const TextsPage = () => {
  const outlet = useOutlet();

  return (
    <div className={styles.layout}>
      <div className={styles.list_panel}>
        <Suspense fallback={<TextsPageSkeleton />}>
          <TextList />
        </Suspense>
      </div>
      <div className={styles.detail_panel}>
        <Suspense fallback={<TextDetailsPageSkeleton />}>
          {outlet ?? <TextDetailPlaceholder />}
        </Suspense>
      </div>
    </div>
  );
};

export default TextsPage;
