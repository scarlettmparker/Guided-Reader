import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge, Button, Checkbox, Input, ScrollArea, SearchBar, cn } from "@sun/components";
import { ChevronRightIcon, ChevronLeftIcon, ChevronDoubleRightIcon, ChevronDoubleLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { usePageData } from "@sun/ssr/react";
import type { AllPermissionsQuery } from "~/generated/graphql";
import styles from "./account-permission-list.module.css";

type AllPermissionsData = AllPermissionsQuery["gaiaQueries"]["allPermissions"];

type AccountPermissionListProps = {
  /**
   * Assigned permission strings.
   */
  assignedPermissions: string[];
  /**
   * Called with next assigned list.
   */
  onChange: (next: string[]) => void;
} & Omit<React.HTMLAttributes<HTMLElement>, "onChange">;

/**
 * Purpose-specific permission list for an account with known catalogue.
 */
const AccountPermissionList = (props: AccountPermissionListProps) => {
  const { assignedPermissions, onChange, className, ...rest } = props;
  const { t } = useTranslation("admin");
  const [availableQuery, setAvailableQuery] = useState("");
  const [assignedQuery, setAssignedQuery] = useState("");
  const [input, setInput] = useState("");
  const [selectedAvailable, setSelectedAvailable] = useState<Set<string>>(new Set());
  const [selectedAssigned, setSelectedAssigned] = useState<Set<string>>(new Set());
  const [drag, setDrag] = useState<{ active: boolean; target: boolean } | null>(null);

  useEffect(() => {
    const end = () => setDrag(null);
    window.addEventListener("mouseup", end);
    return () => window.removeEventListener("mouseup", end);
  }, []);

  const { data: allPermissions } = usePageData<AllPermissionsData>("allPermissions", "admin/all-permissions", {});

  const assigned = useMemo(
    () => [...assignedPermissions].sort((a, b) => a.localeCompare(b)),
    [assignedPermissions],
  );

  const availableFilteredBase = useMemo(() => {
    const catalog = (allPermissions ?? []) as string[];
    return catalog.filter((p) => !assigned.includes(p)).sort((a, b) => a.localeCompare(b));
  }, [assigned, allPermissions]);

  const filteredAvailable = useMemo(() => {
    const q = availableQuery.toLowerCase();
    return q ? availableFilteredBase.filter((v) => v.toLowerCase().includes(q)) : availableFilteredBase;
  }, [availableFilteredBase, availableQuery]);

  const filteredAssigned = useMemo(() => {
    const q = assignedQuery.toLowerCase();
    return q ? assigned.filter((v) => v.toLowerCase().includes(q)) : assigned;
  }, [assigned, assignedQuery]);

  const setAvailable = (id: string, target: boolean) => {
    setSelectedAvailable((prev) => {
      const next = new Set(prev);
      if (target) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const setAssigned = (id: string, target: boolean) => {
    setSelectedAssigned((prev) => {
      const next = new Set(prev);
      if (target) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const onAvailableMouseDown = (value: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const target = !selectedAvailable.has(value);
    setDrag({ active: true, target });
    setAvailable(value, target);
  };

  const onAvailableMouseEnter = (value: string) => () => {
    if (drag?.active) setAvailable(value, drag.target);
  };

  const onAssignedMouseDown = (value: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const target = !selectedAssigned.has(value);
    setDrag({ active: true, target });
    setAssigned(value, target);
  };

  const onAssignedMouseEnter = (value: string) => () => {
    if (drag?.active) setAssigned(value, drag.target);
  };

  const handleAdd = () => {
    const value = input.trim();
    if (!value || assigned.includes(value)) {
      setInput("");
      return;
    }
    onChange([...assigned, value].sort((a, b) => a.localeCompare(b)));
    setInput("");
  };

  const moveSelectedToAssigned = () => {
    if (selectedAvailable.size === 0) return;
    const toMove = [...selectedAvailable].filter((v) => availableFilteredBase.includes(v));
    onChange([...new Set([...assigned, ...toMove])].sort((a, b) => a.localeCompare(b)));
    setSelectedAvailable(new Set());
  };

  const moveSelectedToAvailable = () => {
    if (selectedAssigned.size === 0) return;
    onChange(assigned.filter((v) => !selectedAssigned.has(v)));
    setSelectedAssigned(new Set());
  };

  const moveAllToAssigned = () => {
    if (filteredAvailable.length === 0) return;
    onChange([...new Set([...assigned, ...filteredAvailable])].sort((a, b) => a.localeCompare(b)));
    setSelectedAvailable(new Set());
  };

  const moveAllToAvailable = () => {
    if (filteredAssigned.length === 0) return;
    const remove = new Set(filteredAssigned);
    onChange(assigned.filter((v) => !remove.has(v)));
    setSelectedAssigned(new Set());
  };

  const handleDragStartAvailable = (value: string) => (e: React.DragEvent) => {
    const toDrag = selectedAvailable.has(value) ? [...selectedAvailable] : [value];
    e.dataTransfer.setData("application/json", JSON.stringify(toDrag));
  };

  const handleDragStartAssigned = (value: string) => (e: React.DragEvent) => {
    const toDrag = selectedAssigned.has(value) ? [...selectedAssigned] : [value];
    e.dataTransfer.setData("application/json", JSON.stringify(toDrag));
  };

  const handleDropToAssigned = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const raw = e.dataTransfer.getData("application/json") || e.dataTransfer.getData("text/plain");
      const values: string[] = raw.startsWith("[") ? JSON.parse(raw) : [raw];
      const valid = values.filter((v) => v && availableFilteredBase.includes(v));
      if (valid.length === 0) return;
      onChange([...new Set([...assigned, ...valid])].sort((a, b) => a.localeCompare(b)));
      setSelectedAvailable(new Set());
    } catch {
      // ignore
    }
  };

  const handleDropToAvailable = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const raw = e.dataTransfer.getData("application/json") || e.dataTransfer.getData("text/plain");
      const values: string[] = raw.startsWith("[") ? JSON.parse(raw) : [raw];
      const valid = values.filter((v) => v && assigned.includes(v));
      if (valid.length === 0) return;
      const remove = new Set(valid);
      onChange(assigned.filter((v) => !remove.has(v)));
      setSelectedAssigned(new Set());
    } catch {
      // ignore
    }
  };

  const handleRemoveOne = (value: string) => {
    onChange(assigned.filter((v) => v !== value));
    setSelectedAssigned((prev) => {
      const n = new Set(prev);
      n.delete(value);
      return n;
    });
  };

  return (
    <section className={cn(styles.list_section, className)} {...rest}>
      <fieldset className={styles.input_fieldset}>
        <legend className={styles.legend}>{t("permissions-title")}</legend>
        <div className={styles.input_row}>
          <Input
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            placeholder={t("permission-placeholder")}
            aria-label={t("permission-placeholder")}
          />
          <Button
            variant="secondary"
            onClick={handleAdd}
            disabled={!input.trim()}
            title={t("add-permission")}
            aria-label={t("add-permission")}
          >
            {t("add-permission")}
          </Button>
        </div>
        <p className={styles.hint}>{t("permission-hint")}</p>
      </fieldset>

      <section className={styles.transfer}>
        <fieldset className={styles.column} onDragOver={(e) => e.preventDefault()} onDrop={handleDropToAvailable}>
          <legend className={styles.column_title}>
            {t("available-permissions")} <Badge variant="secondary">{availableFilteredBase.length}</Badge>
          </legend>
          <SearchBar value={availableQuery} onChange={setAvailableQuery} onSearch={setAvailableQuery} placeholder={t("search-permissions")} />
          <ScrollArea maxHeight="22rem" className={styles.list_wrap}>
            <ul className={styles.list} role="listbox" aria-multiselectable="true">
              {filteredAvailable.length === 0 ? (
                <li className={styles.empty} role="status">{t("no-permissions-found")}</li>
              ) : (
                filteredAvailable.map((value) => (
                  <li
                    key={value}
                    role="option"
                    aria-selected={selectedAvailable.has(value)}
                    className={cn(styles.row, selectedAvailable.has(value) && styles.row_selected)}
                    draggable
                    onDragStart={handleDragStartAvailable(value)}
                    onMouseDown={onAvailableMouseDown(value)}
                    onMouseEnter={onAvailableMouseEnter(value)}
                  >
                    <Checkbox checked={selectedAvailable.has(value)} readOnly />
                    <span className={styles.row_label}>{value}</span>
                  </li>
                ))
              )}
            </ul>
          </ScrollArea>
        </fieldset>

        <section className={styles.actions} aria-label={t("transfer-actions")}>
          <Button variant="secondary" title={t("move-selected-to-assigned")} aria-label={t("move-selected-to-assigned")} onClick={moveSelectedToAssigned} disabled={selectedAvailable.size === 0}>
            <ChevronRightIcon width={16} height={16} />
          </Button>
          <Button variant="secondary" title={t("move-selected-to-available")} aria-label={t("move-selected-to-available")} onClick={moveSelectedToAvailable} disabled={selectedAssigned.size === 0}>
            <ChevronLeftIcon width={16} height={16} />
          </Button>
          <Button variant="secondary" title={t("move-all-to-assigned")} aria-label={t("move-all-to-assigned")} onClick={moveAllToAssigned} disabled={filteredAvailable.length === 0}>
            <ChevronDoubleRightIcon width={16} height={16} />
          </Button>
          <Button variant="secondary" title={t("move-all-to-available")} aria-label={t("move-all-to-available")} onClick={moveAllToAvailable} disabled={filteredAssigned.length === 0}>
            <ChevronDoubleLeftIcon width={16} height={16} />
          </Button>
        </section>

        <fieldset className={styles.column} onDragOver={(e) => e.preventDefault()} onDrop={handleDropToAssigned}>
          <legend className={styles.column_title}>
            {t("assigned-permissions")} <Badge variant="secondary">{assigned.length}</Badge>
          </legend>
          <SearchBar value={assignedQuery} onChange={setAssignedQuery} onSearch={setAssignedQuery} placeholder={t("search-permissions")} />
          <ScrollArea maxHeight="22rem" className={styles.list_wrap}>
            <ul className={styles.list} role="listbox" aria-multiselectable="true">
              {filteredAssigned.length === 0 ? (
                <li className={styles.empty} role="status">{t("no-permissions-found")}</li>
              ) : (
                filteredAssigned.map((value) => (
                  <li
                    key={value}
                    role="option"
                    aria-selected={selectedAssigned.has(value)}
                    className={cn(styles.row, selectedAssigned.has(value) && styles.row_selected)}
                    draggable
                    onDragStart={handleDragStartAssigned(value)}
                    onMouseDown={onAssignedMouseDown(value)}
                    onMouseEnter={onAssignedMouseEnter(value)}
                  >
                    <Checkbox checked={selectedAssigned.has(value)} readOnly />
                    <span className={styles.row_label}>{value}</span>
                    <Button
                      variant="secondary"
                      onClick={() => handleRemoveOne(value)}
                      title={t("remove-permission")}
                      aria-label={t("remove-permission")}
                      className={styles.remove_button}
                    >
                      <XMarkIcon width={16} height={16} />
                    </Button>
                  </li>
                ))
              )}
            </ul>
          </ScrollArea>
          <Button
            variant="destructive"
            onClick={() => {
              const toRemove = selectedAssigned.size ? [...selectedAssigned] : filteredAssigned;
              onChange(assigned.filter((v) => !new Set(toRemove).has(v)));
              setSelectedAssigned(new Set());
            }}
            disabled={assigned.length === 0}
            title={t("remove-selected")}
            aria-label={t("remove-selected")}
            className={styles.remove_selected}
          >
            {t("remove-selected")}
          </Button>
        </fieldset>
      </section>
    </section>
  );
};

export default AccountPermissionList;
