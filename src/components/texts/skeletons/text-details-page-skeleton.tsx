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
      <Skeleton className={styles.line_wide} />
      <Skeleton className={styles.line_wide} />
      <Skeleton className={styles.line_narrow} />
      <Skeleton className={styles.line_wide} />
      <Skeleton className={styles.line_medium} />
    </CardBody>
  </Card>
);

export default TextDetailsPageSkeleton;
