import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardHeader, CardTitle } from "@sun/components";
import PropertySetEntriesItems from "~/components/admin/property-sets/property-set-entries-items";
import { PropertySetEntriesSkeleton } from "./skeletons";
import styles from "./property-set-entries.module.css";
import { ScrollArea } from "@sun/components";

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
  const { t } = useTranslation("admin");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("entries")}</CardTitle>
      </CardHeader>
      <CardBody>
        <div className={styles.inner}>
          <Suspense fallback={<PropertySetEntriesSkeleton />}>
            <ScrollArea maxHeight="16rem">
              <PropertySetEntriesItems owner={owner} name={name} />
            </ScrollArea>
          </Suspense>
        </div>
      </CardBody>
    </Card>
  );
};

export default PropertySetEntries;
