import { Skeleton } from "@sun/components";
import styles from "./property-sets-list-skeleton.module.css";

/**
 * Placeholder while property sets load.
 */
const PropertySetsListSkeleton = () => {
  return <Skeleton className={styles.skeleton_block} />;
};

export default PropertySetsListSkeleton;
