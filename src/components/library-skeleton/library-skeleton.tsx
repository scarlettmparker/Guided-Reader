import { Card, CardBody, Skeleton } from "@sun/components";
import styles from "./library-skeleton.module.css";

/**
 * Skeleton for the library page.
 */
const LibrarySkeleton = () => (
  <div className={styles.wrapper}>
    {Array.from({ length: 2 }).map((_, i) => (
      <Card key={i} className={styles.card}>
        <CardBody className={styles.body}>
          <Skeleton className={styles.skeleton_block} />
        </CardBody>
      </Card>
    ))}
  </div>
);

export default LibrarySkeleton;
