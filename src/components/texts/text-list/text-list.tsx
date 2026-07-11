import { Suspense, useState } from "react";
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
 * Text list with search bar, level filter dropdown, and server-side pagination.
 */
const TextList = () => {
  const { t } = useTranslation("texts");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [page, setPage] = useState(0);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const toggleLevel = (level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
    );
    setPage(0);
  };

  const dataProps = { page, search, levels: selectedLevels };

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
                      checked={selectedLevels.includes(level)}
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
            <TextListItems {...dataProps} />
          </Suspense>
        </CardBody>
      </Card>
      <Suspense fallback={null}>
        <TextListPagination
          {...dataProps}
          onPageChange={setPage}
          className={styles.pagination}
        />
      </Suspense>
    </>
  );
};

export default TextList;
