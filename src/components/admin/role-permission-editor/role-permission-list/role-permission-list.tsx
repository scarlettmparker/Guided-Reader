import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge, Button, Checkbox, Input, ScrollArea, SearchBar, cn } from "@sun/components";
import { TrashIcon } from "@heroicons/react/24/outline";
import styles from "./role-permission-list.module.css";

type RolePermissionListProps = {
  /**
   * Assigned permission strings for the role.
   */
  assignedPermissions: string[];
  /**
   * Called with next assigned list.
   */
  onChange: (next: string[]) => void;
} & Omit<React.HTMLAttributes<HTMLElement>, "onChange">;

/**
 * Purpose-specific permission list for a role.
 */
const RolePermissionList = (props: RolePermissionListProps) => {
  const { assignedPermissions, onChange, className, ...rest } = props;
  const { t } = useTranslation("admin");
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragged, setDragged] = useState<string | null>(null);

  const assigned = useMemo(
    () => [...assignedPermissions].sort((a, b) => a.localeCompare(b)),
    [assignedPermissions],
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return q ? assigned.filter((v) => v.toLowerCase().includes(q)) : assigned;
  }, [assigned, query]);

  const toggle = (value: string) => {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setSelected(next);
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

  const handleRemoveSelected = () => {
    if (selected.size === 0) return;
    onChange(assigned.filter((v) => !selected.has(v)));
    setSelected(new Set());
  };

  const handleRemoveOne = (value: string) => {
    onChange(assigned.filter((v) => v !== value));
    setSelected((prev) => {
      const n = new Set(prev);
      n.delete(value);
      return n;
    });
  };

  return (
    <section className={cn(styles.list_section, className)} {...rest}>
      <fieldset className={styles.input_fieldset}>
        <legend className={styles.legend}>{t("role-permissions-title")}</legend>
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

      <fieldset className={styles.column}>
        <legend className={styles.column_title}>
          {t("assigned-permissions")} <Badge variant="secondary">{assigned.length}</Badge>
        </legend>
        <SearchBar value={query} onChange={setQuery} onSearch={setQuery} placeholder={t("search-placeholder")} />
        <ScrollArea maxHeight="22rem" className={styles.list_wrap}>
          <ul className={styles.list} role="listbox" aria-multiselectable="true">
            {filtered.length === 0 ? (
              <li className={styles.empty} role="status">{t("no-items-found")}</li>
            ) : (
              filtered.map((value) => (
                <li
                  key={value}
                  role="option"
                  aria-selected={selected.has(value)}
                  className={cn(styles.row, dragged === value && styles.row_dragging)}
                  draggable
                  onDragStart={(e) => {
                    setDragged(value);
                    e.dataTransfer.setData("text/plain", value);
                  }}
                  onDragEnd={() => setDragged(null)}
                >
                  <label className={styles.row_label_wrap}>
                    <Checkbox checked={selected.has(value)} onChange={() => toggle(value)} />
                    <span className={styles.row_label}>{value}</span>
                  </label>
                  <Button
                    variant="secondary"
                    onClick={() => handleRemoveOne(value)}
                    title={t("remove-permission")}
                    aria-label={t("remove-permission")}
                    className={styles.remove_button}
                  >
                    <TrashIcon width={16} height={16} />
                  </Button>
                </li>
              ))
            )}
          </ul>
        </ScrollArea>
        <Button
          variant="secondary"
          onClick={handleRemoveSelected}
          disabled={selected.size === 0}
          title={t("remove-selected")}
          aria-label={t("remove-selected")}
        >
          {t("remove-selected")}
        </Button>
      </fieldset>
    </section>
  );
};

export default RolePermissionList;
