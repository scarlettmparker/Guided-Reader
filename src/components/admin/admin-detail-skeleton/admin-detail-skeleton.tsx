import { Card, CardBody, Skeleton } from "@sun/components";
import styles from "./admin-detail-skeleton.module.css";

/**
 * Skeleton for the admin detail panel while data loads.
 */
const AdminDetailSkeleton = () => (
  <Card>
    <CardBody>
      <Skeleton className={styles.skeleton_block} />
    </CardBody>
  </Card>
);

export default AdminDetailSkeleton;
