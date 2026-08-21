import { Card, CardBody, CardHeader, Skeleton } from "@sun/components";
import styles from "./admin-page-skeleton.module.css";

/**
 * Skeleton for the full admin page while data loads.
 */
const AdminPageSkeleton = () => (
  <div className={styles.layout}>
    <div className={styles.list_panel}>
      <Card>
        <CardHeader>
          <Skeleton className={styles.skeleton_title} />
        </CardHeader>
        <CardBody className={styles.skeleton_list}>
          <Skeleton className={styles.skeleton_row} />
          <Skeleton className={styles.skeleton_row} />
        </CardBody>
      </Card>
    </div>
    <div className={styles.detail_panel}>
      <Card>
        <CardBody>
          <Skeleton className={styles.skeleton_block} />
        </CardBody>
      </Card>
    </div>
  </div>
);

export default AdminPageSkeleton;
