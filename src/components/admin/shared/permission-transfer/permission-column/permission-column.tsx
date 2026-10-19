import { useMemo, useState } from "react";
import { Badge, Checkbox, ScrollArea, SearchBar, cn } from "@sun/components";
import styles from "./permission-column.module.css";

type PermissionColumnProps = {
  /**
   * Column title.
   */
  title: string;
  /**
   * All items for this column.
   */
  items: string[];
  /**
   * Selected set.
   */
  selected: Set<string>;
  /**
   * Paint handlers.
   */
  paint: {
    onMouseDown: (value: string) => (event: React.MouseEvent) => void;
    onMouseEnter: (value: string) => () => void;
  };
  /**
   * Search placeholder.
   */
  placeholder?: string;
  /**
   * Empty label.
   */
  emptyLabel?: string;
} & React.HTMLAttributes<HTMLFieldSetElement>;

/**
 * Single column with internal search and paint selection.
 */
const PermissionColumn = (props: PermissionColumnProps) => {
  const {
    title,
    items,
    selected,
    paint,
    placeholder = "Search...",
    emptyLabel = "No items found",
    className,
    ...rest
  } = props;
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return q ? items.filter((v) => v.toLowerCase().includes(q)) : items;
  }, [items, query]);

  return (
    <fieldset className={cn(styles.column, className)} {...rest}>
      <legend className={styles.column_title}>
        {title} <Badge variant="secondary">{items.length}</Badge>
      </legend>
      <SearchBar value={query} onChange={setQuery} onSearch={setQuery} placeholder={placeholder} />
      <ScrollArea maxHeight="22rem" className={styles.list_wrap}>
        <ul className={styles.list} role="listbox" aria-multiselectable="true">
          {filtered.length === 0 ? (
            <li className={styles.empty} role="status">
              {emptyLabel}
            </li>
          ) : (
            filtered.map((value) => (
              <li
                key={value}
                role="option"
                aria-selected={selected.has(value)}
                className={cn(styles.row, selected.has(value) && styles.row_selected)}
                onMouseDown={paint.onMouseDown(value)}
                onMouseEnter={paint.onMouseEnter(value)}
              >
                <Checkbox checked={selected.has(value)} readOnly />
                <span className={styles.row_label}>{value}</span>
              </li>
            ))
          )}
        </ul>
      </ScrollArea>
    </fieldset>
  );
};

export default PermissionColumn;
