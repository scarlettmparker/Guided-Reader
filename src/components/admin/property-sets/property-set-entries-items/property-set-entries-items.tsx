import { useTranslation } from "react-i18next";
import { usePageData } from "@sun/ssr/react";
import { Badge } from "@sun/components";
import type { PropertySetEntry } from "~/generated/graphql";
import styles from "./property-set-entries-items.module.css";

type PropertySetEntriesItemsProps = {
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
 * Renders entry rows for a property set.
 */
const PropertySetEntriesItems = (props: PropertySetEntriesItemsProps) => {
  const { owner, name } = props;
  const { t } = useTranslation("admin");
  const { data } = usePageData<PropertySetEntry[]>(
    "propertySetEntries",
    "admin/property-sets/:owner/:name",
    { owner, name },
  );
  const entries = (data as PropertySetEntry[] | undefined) ?? [];

  if (!entries.length) {
    return <p className={styles.no_items}>{t("no-entries-found")}</p>;
  }

  return (
    <div className={styles.list_body}>
      {entries.map((entry) => (
        <div key={entry.id} className={styles.item_row}>
          <span className={styles.entry_name}>{entry.entryName}</span>
          <span className={styles.entry_values}>
            <Badge>{JSON.stringify(entry.values).slice(0, 80)}</Badge>
          </span>
        </div>
      ))}
    </div>
  );
};

export default PropertySetEntriesItems;
