import { Suspense } from "react";
import { Skeleton } from "@sun/components";
import ContinueReading from "~/components/library/continue-reading";
import Recent from "~/components/library/recent";
import styles from "./library.module.css";

/**
 * Real library page with viewed and recent sections.
 */
const Library = () => {
  return (
    <div className={styles.library_layout}>
      <Suspense fallback={<Skeleton style={{ width: "100%", height: "12rem" }} />}>
        <ContinueReading />
      </Suspense>
      <Suspense fallback={<Skeleton style={{ width: "100%", height: "12rem" }} />}>
        <Recent />
      </Suspense>
    </div>
  );
};

export default Library;
