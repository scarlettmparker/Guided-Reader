import { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@sun/components";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  SearchBar,
} from "@sun/components";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import TextListItems from "~/components/texts/text-list-items";
import TextListPagination from "~/components/texts/text-list-pagination";
import styles from "./text-list.module.css";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

/**
 * Sets or removes a single search param, preserving the rest.
 */
function updateParams(
  searchParams: URLSearchParams,
  key: string,
  value: string | null,
): URLSearchParams {
  const next = new URLSearchParams(searchParams);
  if (value === null || value === "") {
    next.delete(key);
  } else {
    next.set(key, value);
  }
  return next;
}

/**
 * Text list with search, level filters, and pagination.
 */
const TextList = () => {
  const { t } = useTranslation("texts");
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const levels = searchParams.get("levels")?.split(",").filter(Boolean) ?? [];
  const page = Number(searchParams.get("page") ?? "0");

  const [searchInput, setSearchInput] = useState(search);
  const [, startTransition] = useTransition();

  /**
   * Sets the search query in the query params and resets the page to 0.
   * @param value Search query string (empty string to clear)
   */
  const handleSearch = (value: string) => {
    setSearchParams((prev) => {
      const next = updateParams(prev, "search", value || null);
      next.delete("page");
      return next;
    });
  };

  /**
   * Sets or removes a CEFR level filter in the query params.
   * @param level Level to toggle (e.g., "A1", "B2").
   */
  const toggleLevel = (level: string) => {
    setSearchParams((prev) => {
      const current = prev.get("levels")?.split(",").filter(Boolean) ?? [];
      const next = current.includes(level)
        ? current.filter((l) => l !== level)
        : [...current, level];

      // Update query params with new levels.
      const updated = updateParams(
        prev,
        "levels",
        next.length > 0 ? next.join(",") : null,
      );
      updated.delete("page");
      return updated;
    });
  };

  const handlePageChange = (newPage: number) => {
    // Wrap page change in startTransition to avoid blocking the UI while fetching new data.
    startTransition(() => {
      setSearchParams((prev) =>
        updateParams(prev, "page", newPage > 0 ? String(newPage) : null),
      );
    });
  };

  const pagination = { page, search, levels };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardBody>
          <div className={styles.toolbar}>
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSearch={handleSearch}
              placeholder={t("search-placeholder")}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  title={t("filter-levels")}
                  aria-label={t("filter-levels")}
                >
                  <AdjustmentsHorizontalIcon width={16} height={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {LEVELS.map((level) => (
                  <label key={level} className={styles.level_label}>
                    <Checkbox
                      checked={levels.includes(level)}
                      onChange={() => toggleLevel(level)}
                    />
                    {level}
                  </label>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Suspense
            fallback={
              <div className={styles.skeleton_list}>
                <Skeleton style={{ width: "100%", height: "20rem" }} />
              </div>
            }
          >
            <TextListItems {...pagination} />
          </Suspense>
        </CardBody>
      </Card>
      <Suspense fallback={null}>
        <TextListPagination
          {...pagination}
          onPageChange={handlePageChange}
          className={styles.pagination}
        />
      </Suspense>
    </>
  );
};

export default TextList;
