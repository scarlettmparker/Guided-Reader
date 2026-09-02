import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import type { PropertySetEntry } from "~/generated/graphql";
import PropertySetEntryDialog from "~/components/admin/property-sets/property-set-entry-dialog";
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
  const [selected, setSelected] = useState<PropertySetEntry | null>(null);

  if (!entries.length) {
    return <p className={styles.no_items}>{t("no-entries-found")}</p>;
  }

  return (
    <div className={styles.list_body}>
      {entries.map((entry) => (
        <Button
          key={entry.id}
          variant="secondary"
          className={styles.entry_button}
          onClick={() => setSelected(entry)}
          title={entry.entryName}
          aria-label={entry.entryName}
        >
          <span className={styles.entry_name}>{entry.entryName}</span>
        </Button>
      ))}
      <PropertySetEntryDialog
        owner={owner}
        name={name}
        entry={selected}
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
};

export default PropertySetEntriesItems;
