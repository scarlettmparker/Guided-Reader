import { Suspense } from "react";
import { useOutlet } from "react-router-dom";
import PropertySetsList from "~/components/admin/property-sets/property-sets-list";
import PropertySetsPlaceholder from "~/components/admin/property-sets/property-sets-placeholder";
import { PropertySetEntriesSkeleton } from "~/components/admin/property-sets/property-set-entries/skeletons";
import styles from "./property-sets.module.css";

/**
 * Two-panel layout for Knowledge property sets.
 */
const PropertySets = () => {
  const outlet = useOutlet();

  return (
    <div className={styles.items_layout}>
      <div className={styles.items_list_panel}>
        <PropertySetsList />
      </div>
      <div className={styles.items_detail_panel}>
        <Suspense fallback={<PropertySetEntriesSkeleton />}>
          {outlet ?? <PropertySetsPlaceholder />}
        </Suspense>
      </div>
    </div>
  );
};

export default PropertySets;
