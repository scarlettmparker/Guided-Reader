import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge, Button, Checkbox, ScrollArea, SearchBar, cn } from "@sun/components";
import { ChevronRightIcon, ChevronLeftIcon, ChevronDoubleRightIcon, ChevronDoubleLeftIcon } from "@heroicons/react/24/outline";
import type { RolesQuery } from "~/generated/graphql";
import styles from "./account-role-transfer-list.module.css";

type RolesData = RolesQuery["gaiaQueries"]["roles"];

type AccountRoleTransferListProps = {
  /**
   * All roles.
   */
  roles: RolesData;
  /**
   * Assigned role names.
   */
  assignedRoleNames: string[];
  /**
   * Called with next assigned names.
   */
  onChange: (next: string[]) => void;
} & Omit<React.HTMLAttributes<HTMLElement>, "onChange">;

/**
 * Purpose-specific transfer list for account roles.
 */
const AccountRoleTransferList = (props: AccountRoleTransferListProps) => {
  const { roles, assignedRoleNames, onChange, className, ...rest } = props;
  const { t } = useTranslation("admin");
  const [availableQuery, setAvailableQuery] = useState("");
  const [assignedQuery, setAssignedQuery] = useState("");
  const [selectedAvailable, setSelectedAvailable] = useState<Set<string>>(new Set());
  const [selectedAssigned, setSelectedAssigned] = useState<Set<string>>(new Set());
  const [dragged, setDragged] = useState<string | null>(null);

  const allNames = useMemo(
    () => (roles ?? []).map((r) => r.name).sort((a, b) => a.localeCompare(b)),
    [roles],
  );
  const assigned = useMemo(
    () => [...assignedRoleNames].sort((a, b) => a.localeCompare(b)),
    [assignedRoleNames],
  );
  const available = useMemo(
    () => allNames.filter((n) => !assigned.includes(n)),
    [allNames, assigned],
  );

  const filteredAvailable = useMemo(() => {
    const q = availableQuery.toLowerCase();
    return q ? available.filter((v) => v.toLowerCase().includes(q)) : available;
  }, [available, availableQuery]);

  const filteredAssigned = useMemo(() => {
    const q = assignedQuery.toLowerCase();
    return q ? assigned.filter((v) => v.toLowerCase().includes(q)) : assigned;
  }, [assigned, assignedQuery]);

  const toggleAvailable = (value: string) => {
    const next = new Set(selectedAvailable);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setSelectedAvailable(next);
  };

  const toggleAssigned = (value: string) => {
    const next = new Set(selectedAssigned);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setSelectedAssigned(next);
  };

  const moveSelectedToAssigned = () => {
    if (selectedAvailable.size === 0) return;
    const toMove = [...selectedAvailable].filter((v) => available.includes(v));
    const next = [...assigned, ...toMove].sort((a, b) => a.localeCompare(b));
    onChange([...new Set(next)]);
    setSelectedAvailable(new Set());
  };

  const moveSelectedToAvailable = () => {
    if (selectedAssigned.size === 0) return;
    const next = assigned.filter((v) => !selectedAssigned.has(v));
    onChange(next);
    setSelectedAssigned(new Set());
  };

  const moveAllToAssigned = () => {
    if (filteredAvailable.length === 0) return;
    const next = [...assigned, ...filteredAvailable].sort((a, b) => a.localeCompare(b));
    onChange([...new Set(next)]);
    setSelectedAvailable(new Set());
  };

  const moveAllToAvailable = () => {
    if (filteredAssigned.length === 0) return;
    const remove = new Set(filteredAssigned);
    const next = assigned.filter((v) => !remove.has(v));
    onChange(next);
    setSelectedAssigned(new Set());
  };

  const handleDropToAssigned = (e: React.DragEvent) => {
    e.preventDefault();
    const value = e.dataTransfer.getData("text/plain") || dragged;
    if (!value || assigned.includes(value)) return;
    onChange([...assigned, value].sort((a, b) => a.localeCompare(b)));
    setDragged(null);
    setSelectedAvailable((prev) => {
      const n = new Set(prev);
      n.delete(value);
      return n;
    });
  };

  const handleDropToAvailable = (e: React.DragEvent) => {
    e.preventDefault();
    const value = e.dataTransfer.getData("text/plain") || dragged;
    if (!value || !assigned.includes(value)) return;
    onChange(assigned.filter((v) => v !== value));
    setDragged(null);
    setSelectedAssigned((prev) => {
      const n = new Set(prev);
      n.delete(value);
      return n;
    });
  };

  return (
    <section className={cn(styles.transfer, className)} {...rest}>
      <fieldset className={styles.column} onDragOver={(e) => e.preventDefault()} onDrop={handleDropToAvailable}>
        <legend className={styles.column_title}>
          {t("available-roles")} <Badge variant="secondary">{available.length}</Badge>
        </legend>
        <SearchBar value={availableQuery} onChange={setAvailableQuery} onSearch={setAvailableQuery} placeholder={t("search-placeholder")} />
        <ScrollArea maxHeight="22rem" className={styles.list_wrap}>
          <ul className={styles.list} role="listbox" aria-multiselectable="true">
            {filteredAvailable.length === 0 ? (
              <li className={styles.empty} role="status">{t("no-items-found")}</li>
            ) : (
              filteredAvailable.map((value) => (
                <li
                  key={value}
                  role="option"
                  aria-selected={selectedAvailable.has(value)}
                  className={cn(styles.row, dragged === value && styles.row_dragging)}
                  draggable
                  onDragStart={(e) => {
                    setDragged(value);
                    e.dataTransfer.setData("text/plain", value);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => setDragged(null)}
                >
                  <label className={styles.row_label_wrap}>
                    <Checkbox checked={selectedAvailable.has(value)} onChange={() => toggleAvailable(value)} />
                    <span className={styles.row_label}>{value}</span>
                  </label>
                </li>
              ))
            )}
          </ul>
        </ScrollArea>
      </fieldset>

      <section className={styles.actions} aria-label={t("transfer-actions")}>
        <Button
          variant="secondary"
          title={t("move-selected-to-assigned")}
          aria-label={t("move-selected-to-assigned")}
          onClick={moveSelectedToAssigned}
          disabled={selectedAvailable.size === 0}
        >
          <ChevronRightIcon width={16} height={16} />
        </Button>
        <Button
          variant="secondary"
          title={t("move-selected-to-available")}
          aria-label={t("move-selected-to-available")}
          onClick={moveSelectedToAvailable}
          disabled={selectedAssigned.size === 0}
        >
          <ChevronLeftIcon width={16} height={16} />
        </Button>
        <Button
          variant="secondary"
          title={t("move-all-to-assigned")}
          aria-label={t("move-all-to-assigned")}
          onClick={moveAllToAssigned}
          disabled={filteredAvailable.length === 0}
        >
          <ChevronDoubleRightIcon width={16} height={16} />
        </Button>
        <Button
          variant="secondary"
          title={t("move-all-to-available")}
          aria-label={t("move-all-to-available")}
          onClick={moveAllToAvailable}
          disabled={filteredAssigned.length === 0}
        >
          <ChevronDoubleLeftIcon width={16} height={16} />
        </Button>
      </section>

      <fieldset className={styles.column} onDragOver={(e) => e.preventDefault()} onDrop={handleDropToAssigned}>
        <legend className={styles.column_title}>
          {t("assigned-roles")} <Badge variant="secondary">{assigned.length}</Badge>
        </legend>
        <SearchBar value={assignedQuery} onChange={setAssignedQuery} onSearch={setAssignedQuery} placeholder={t("search-placeholder")} />
        <ScrollArea maxHeight="22rem" className={styles.list_wrap}>
          <ul className={styles.list} role="listbox" aria-multiselectable="true">
            {filteredAssigned.length === 0 ? (
              <li className={styles.empty} role="status">{t("no-items-found")}</li>
            ) : (
              filteredAssigned.map((value) => (
                <li
                  key={value}
                  role="option"
                  aria-selected={selectedAssigned.has(value)}
                  className={cn(styles.row, dragged === value && styles.row_dragging)}
                  draggable
                  onDragStart={(e) => {
                    setDragged(value);
                    e.dataTransfer.setData("text/plain", value);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => setDragged(null)}
                >
                  <label className={styles.row_label_wrap}>
                    <Checkbox checked={selectedAssigned.has(value)} onChange={() => toggleAssigned(value)} />
                    <span className={styles.row_label}>{value}</span>
                  </label>
                </li>
              ))
            )}
          </ul>
        </ScrollArea>
      </fieldset>
    </section>
  );
};

export default AccountRoleTransferList;
