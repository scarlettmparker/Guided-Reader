import { Skeleton } from "@sun/components";
import styles from "./property-set-entries-skeleton.module.css";

/**
 * Placeholder while entries load.
 */
const PropertySetEntriesSkeleton = () => {
  return <Skeleton className={styles.skeleton_block} />;
};

export default PropertySetEntriesSkeleton;
