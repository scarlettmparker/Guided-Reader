import { Card, CardBody, CardHeader, Skeleton } from "@sun/components";
import styles from "./texts-page-skeleton.module.css";

/**
 * Skeleton for the texts list panel.
 */
const TextsPageSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className={styles.title} />
    </CardHeader>
    <CardBody className={styles.body}>
      <Skeleton className={styles.search} />
      <Skeleton className={styles.row} />
    </CardBody>
  </Card>
);

export default TextsPageSkeleton;
