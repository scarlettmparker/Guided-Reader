import { Link, useLocation } from "react-router-dom";
import { usePageData } from "@sun/ssr/react";
import { cn } from "@sun/components";
import type { ListTextsQuery } from "~/generated/graphql";
import styles from "./text-list-items.module.css";

type PagedTexts = ListTextsQuery["hadesQueries"]["texts"];

type TextListItemsProps = {
  /**
   * Zero-based page index.
   */
  page: number;
  /**
   * Committed search query (empty string for no filter).
   */
  search: string;
  /**
   * Selected CEFR levels (empty for no filter).
   */
  levels: string[];
};

/**
 * Renders the filtered, paginated text list items. Suspends on data fetch.
 *
 * @param page zero-based page index
 * @param search committed search query
 * @param levels selected CEFR levels
 */
const TextListItems = ({ page, search, levels }: TextListItemsProps) => {
  const { pathname } = useLocation();
  const { data } = usePageData<PagedTexts>("texts", "texts", {
    page,
    search: search || undefined,
    levels: levels.length > 0 ? levels : undefined,
  });

  const items = data?.items ?? [];

  return (
    <ul className={styles.list}>
      {items.map((item) => {
        const isActive = pathname === `/texts/${item.id}`;
        return (
          <li key={item.id}>
            <Link
              to={`/texts/${item.id}`}
              className={cn(styles.item, isActive && styles.item_active)}
            >
              {item.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default TextListItems;
