import { Suspense } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@sun/components";
import PropertySetEntriesItems from "~/components/admin/property-sets/property-set-entries-items";
import { PropertySetEntriesSkeleton } from "./skeletons";
import styles from "./property-set-entries.module.css";

type PropertySetEntriesProps = {
  /**
   * Owner key of the property set.
   */
  owner: string;
  /**
   * Name of the property set.
   */
  name: string;
};

/**
 * Card showing entries for a property set.
 */
const PropertySetEntries = (props: PropertySetEntriesProps) => {
  const { owner, name } = props;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardBody>
        <div className={styles.inner}>
          <Suspense fallback={<PropertySetEntriesSkeleton />}>
            <PropertySetEntriesItems owner={owner} name={name} />
          </Suspense>
        </div>
      </CardBody>
    </Card>
  );
};

export default PropertySetEntries;
