import { Suspense } from "react";
import { Skeleton } from "@sun/components";
import ContinueReading from "~/components/library/continue-reading";
import Recent from "~/components/library/recent";
import ByLevel from "~/components/library/by-level";
import styles from "./library.module.css";

/**
 * Real library page with viewed, recent, and by-level sections.
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
      <Suspense fallback={<Skeleton style={{ width: "100%", height: "12rem" }} />}>
        <ByLevel />
      </Suspense>
    </div>
  );
};

export default Library;
