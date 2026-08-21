import { Card, CardBody, CardHeader, Skeleton } from "@sun/components";
import styles from "./page-skeleton.module.css";

/**
 * Generic page skeleton for simple routes.
 */
const PageSkeleton = () => (
  <Card className={styles.card}>
    <CardHeader>
      <Skeleton className={styles.skeleton_title} />
    </CardHeader>
    <CardBody className={styles.body}>
      <Skeleton className={styles.skeleton_block} />
    </CardBody>
  </Card>
);

export default PageSkeleton;
