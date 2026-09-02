import { Suspense } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Card, CardBody, CardHeader, CardTitle } from "@sun/components";
import PropertySetsListItems from "~/components/admin/property-sets/property-sets-list-items";
import { PropertySetsListSkeleton } from "./skeletons";
import styles from "./property-sets-list.module.css";

type PropertySetsListProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Searchable list of Knowledge property sets.
 */
const PropertySetsList = (_props: PropertySetsListProps) => {
  const { t } = useTranslation("admin");

  return (
    <Card>
      <CardHeader className={styles.header}>
        <CardTitle>{t("property-sets-title")}</CardTitle>
        <Link to="/admin" className={styles.header_link}>
          <Button
            variant="secondary"
            title={t("title")}
            aria-label={t("title")}
          >
            {t("title")}
          </Button>
        </Link>
      </CardHeader>
      <CardBody>
        <div className={styles.inner}>
          <Suspense fallback={<PropertySetsListSkeleton />}>
            <PropertySetsListItems />
          </Suspense>
        </div>
      </CardBody>
    </Card>
  );
};

export default PropertySetsList;
