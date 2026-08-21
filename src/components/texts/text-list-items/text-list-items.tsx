import { Link, useLocation, useSearchParams } from "react-router-dom";
import { usePageData } from "@sun/ssr/react";
import { Badge, cn } from "@sun/components";
import type { ListTextsQuery } from "~/generated/graphql";
import { CEFR_TO_KEY } from "~/utils/cefr";
import styles from "./text-list-items.module.css";

type PagedTexts = ListTextsQuery["hadesQueries"]["texts"];

/**
 * Renders the filtered, paginated text list items. Suspends on data fetch.
 */
const TextListItems = () => {
  const { pathname, search: queryString } = useLocation();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const levels = searchParams.get("levels")?.split(",").filter(Boolean) ?? [];
  const page = Number(searchParams.get("page") ?? "0");
  const { data } = usePageData<PagedTexts>("texts", "texts", {
    page,
    search: search || undefined,
    levels: levels.length > 0 ? levels : undefined,
  });
  const { data: levelColours } = usePageData<Record<string, string> | null>(
    "levelColours",
    "levelColours",
  );

  const items = data?.items ?? [];

  return (
    <ul className={styles.list}>
      {items.map((item) => {
        const isActive = pathname === `/texts/${item.id}`;
        const colour = levelColours?.[CEFR_TO_KEY[item.level]];
        return (
          <li key={item.id}>
            <Link
              to={`/texts/${item.id}${queryString}`}
              className={cn(styles.item, isActive && styles.item_active)}
            >
              <Badge
                className={styles.item_level}
                style={colour ? { backgroundColor: colour } : undefined}
              >
                {item.level}
              </Badge>
              <span className={styles.item_title}>{item.title}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default TextListItems;
