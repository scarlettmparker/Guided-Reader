import { Skeleton } from "@sun/components";
import styles from "./property-set-schema-editor-skeleton.module.css";

/**
 * Placeholder while schema loads.
 */
const PropertySetSchemaEditorSkeleton = () => {
  return <Skeleton className={styles.skeleton_block} />;
};

export default PropertySetSchemaEditorSkeleton;
