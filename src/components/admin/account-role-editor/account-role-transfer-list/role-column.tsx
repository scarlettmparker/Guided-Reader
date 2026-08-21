import { Badge, Checkbox, ScrollArea, SearchBar, cn } from "@sun/components";
import styles from "./account-role-transfer-list.module.css";

type RoleColumnProps = {
  /**
   * Column title key.
   */
  title: string;
  /**
   * Number badge.
   */
  count: number;
  /**
   * Search placeholder.
   */
  placeholder: string;
  /**
   * Search query.
   */
  query: string;
  /**
   * Called when search changes.
   */
  onQueryChange: (value: string) => void;
  /**
   * Called when search submitted.
   */
  onSearch: (value: string) => void;
  /**
   * Items to display.
   */
  items: string[];
  /**
   * Selected set.
   */
  selected: Set<string>;
  /**
   * Empty message.
   */
  emptyLabel: string;
  /**
   * Drag start handler.
   */
  onDragStart: (value: string) => (e: React.DragEvent) => void;
  /**
   * Mouse down handler for paint.
   */
  onMouseDown: (value: string) => (e: React.MouseEvent) => void;
  /**
   * Mouse enter handler for paint.
   */
  onMouseEnter: (value: string) => () => void;
  /**
   * Drop handler.
   */
  onDrop: (e: React.DragEvent) => void;
} & Omit<React.HTMLAttributes<HTMLElement>, "onDragStart">;

/**
 * Single column with search and selectable list for roles.
 */
const RoleColumn = (props: RoleColumnProps) => {
  const {
    title,
    count,
    placeholder,
    query,
    onQueryChange,
    onSearch,
    items,
    selected,
    emptyLabel,
    onDragStart,
    onMouseDown,
    onMouseEnter,
    onDrop,
    className,
    ...rest
  } = props;

  return (
    <fieldset className={cn(styles.column, className)} onDragOver={(e) => e.preventDefault()} onDrop={onDrop} {...rest}>
      <legend className={styles.column_title}>
        {title} <Badge variant="secondary">{count}</Badge>
      </legend>
      <SearchBar value={query} onChange={onQueryChange} onSearch={onSearch} placeholder={placeholder} />
      <ScrollArea maxHeight="22rem" className={styles.list_wrap}>
        <ul className={styles.list} role="listbox" aria-multiselectable="true">
          {items.length === 0 ? (
            <li className={styles.empty} role="status">{emptyLabel}</li>
          ) : (
            items.map((value) => (
              <li
                key={value}
                role="option"
                aria-selected={selected.has(value)}
                className={cn(styles.row, selected.has(value) && styles.row_selected)}
                draggable
                onDragStart={onDragStart(value)}
                onMouseDown={onMouseDown(value)}
                onMouseEnter={onMouseEnter(value)}
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

export default RoleColumn;
