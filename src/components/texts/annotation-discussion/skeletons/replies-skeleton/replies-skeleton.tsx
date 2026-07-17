import { Skeleton } from "@sun/components";
import styles from "./replies-skeleton.module.css";

type RepliesSkeletonProps = {
  /**
   * Number of placeholder rows to render.
   */
  count: number;
};

/**
 * Loading placeholder for an annotation's reply list.
 */
const RepliesSkeleton = ({ count }: RepliesSkeletonProps) => (
  <ul className={styles.list} aria-hidden>
    {Array.from({ length: count }, (_, index) => (
      <li key={index} className={styles.row}>
        <Skeleton className={styles.avatar} />
        <div className={styles.lines}>
          <Skeleton className={styles.name} />
          <Skeleton className={styles.line} />
        </div>
      </li>
    ))}
  </ul>
);

export default RepliesSkeleton;
