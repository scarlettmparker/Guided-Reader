import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@sun/components";
import { EllipsisVerticalIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { usePageData } from "@sun/ssr/react";
import type { PropertySetEntry } from "~/generated/graphql";
import PropertySetEntryDialog from "~/components/admin/property-sets/property-set-entry-dialog";
import ConfirmDeleteEntryDialog from "~/components/admin/property-sets/confirm-delete-entry-dialog";
import { deletePropertyEntry } from "~/server/actions/propertySets";
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
  const [deleteTarget, setDeleteTarget] = useState<PropertySetEntry | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    startTransition(async () => {
      await deletePropertyEntry(owner, name, target.entryName);
      setDeleteTarget(null);
    });
  };

  if (!entries.length) {
    return <p className={styles.no_items}>{t("no-entries-found")}</p>;
  }

  return (
    <div className={styles.list_body}>
      {entries.map((entry) => (
        <Button
          key={entry.id}
          variant="secondary"
          className={styles.list_button}
          onClick={() => setSelected(entry)}
          title={entry.entryName}
          aria-label={entry.entryName}
        >
          <span className={styles.list_name}>{entry.entryName}</span>
          <span
            className={styles.list_actions}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <EllipsisVerticalIcon
                  width={16}
                  height={16}
                  title={t("entry-actions")}
                  aria-label={t("entry-actions")}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelected(entry)}>
                  <PencilSquareIcon width={16} height={16} />
                  {t("edit-entry")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteTarget(entry)}
                >
                  <TrashIcon width={16} height={16} />
                  {t("delete-entry")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
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
      <ConfirmDeleteEntryDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        entryName={deleteTarget?.entryName ?? ""}
      />
      {isPending && <span className={styles.pending} aria-hidden="true" />}
    </div>
  );
};

export default PropertySetEntriesItems;
