import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePageData } from "@sun/ssr/react";
import type { PropertySetSchema } from "~/generated/graphql";
import styles from "./property-sets-list-items.module.css";

type PropertySetsListItemsProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Renders the list body for Knowledge property sets.
 */
const PropertySetsListItems = (_props: PropertySetsListItemsProps) => {
  const { t } = useTranslation("admin");
  const { data } = usePageData<PropertySetSchema[]>(
    "propertySetSchemas",
    "admin/property-sets",
    { ownerKey: "Knowledge" },
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
              to={`/admin/property-sets/${schema.ownerKey ?? "Knowledge"}/${schema.name}`}
              className={styles.item_link}
            >
              <span className={styles.list_name}>{schema.name}</span>
            </Link>
            <span className={styles.list_actions}>{schema.configurable ? "configurable" : ""}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default PropertySetsListItems;
