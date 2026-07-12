import { Card, CardBody, CardHeader, Skeleton } from "@sun/components";
import styles from "./text-details-page-skeleton.module.css";

/**
 * Skeleton for the text detail panel.
 */
const TextDetailsPageSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className={styles.title} />
      <Skeleton className={styles.meta} />
    </CardHeader>
    <CardBody className={styles.body}>
      <Skeleton className={styles.skeleton_body} />
    </CardBody>
  </Card>
);

export default TextDetailsPageSkeleton;
