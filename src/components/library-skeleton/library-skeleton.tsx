import { Card, CardBody, CardHeader, Skeleton } from "@sun/components";
import styles from "./library-skeleton.module.css";

/**
 * Skeleton for the library page.
 */
const LibrarySkeleton = () => (
  <div className={styles.wrapper}>
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i} className={styles.card}>
        <CardHeader>
          <Skeleton className={styles.skeleton_title} />
        </CardHeader>
        <CardBody className={styles.body}>
          <Skeleton className={styles.skeleton_block} />
          <Skeleton className={styles.skeleton_row} />
        </CardBody>
      </Card>
    ))}
  </div>
);

export default LibrarySkeleton;
