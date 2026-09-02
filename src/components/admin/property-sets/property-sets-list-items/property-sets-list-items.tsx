import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge } from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import type { PropertySetSchema } from "~/generated/graphql";
import styles from "./property-sets-list-items.module.css";

type PropertySetsListItemsProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Renders the list body for property sets.
 */
const PropertySetsListItems = (_props: PropertySetsListItemsProps) => {
  const { t } = useTranslation("admin");
  const { data } = usePageData<PropertySetSchema[]>(
    "propertySetSchemas",
    "admin/property-sets",
    {},
  );
  const schemas = data ?? [];

  return (
    <div className={styles.list_body}>
      {!schemas.length ? (
        <p className={styles.no_items}>{t("no-property-sets")}</p>
      ) : (
        schemas.map((schema) => (
          <div key={schema.id} className={styles.item_row}>
            <Link
              to={`/admin/property-sets/${schema.ownerKey ?? "Unknown"}/${schema.name}`}
              className={styles.item_link}
            >
              <span className={styles.list_name}>{schema.name}</span>
            </Link>
            <span className={styles.list_actions}>
              <Badge>{schema.ownerKey ?? "Unknown"}</Badge>
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default PropertySetsListItems;
