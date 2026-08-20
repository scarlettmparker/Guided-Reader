import { Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogHeader, DialogTitle, DialogBody, DialogFooter, Button, SearchBar } from "@sun/components";
import { centeredDialogPosition } from "~/utils/dialog-position";
import DefinitionContent from "../definition-content";
import styles from "./definition-dialog.module.css";

type DefinitionDialogProps = {
  /**
   * Whether the dialog is open.
   */
  open: boolean;
  /**
   * Called when the open state changes.
   */
  onOpenChange: (open: boolean) => void;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Draggable dialog with a search bar that fetches a WordReference definition.
 */
const DefinitionDialog = (props: DefinitionDialogProps) => {
  const { open, onOpenChange, ...rest } = props;
  const { t } = useTranslation("texts");
  const [inputValue, setInputValue] = useState("");
  const [searchWord, setSearchWord] = useState("");

  const handleSearch = () => {
    setSearchWord(inputValue.trim());
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  const title = searchWord
    ? t("definition.dialog-title", { word: searchWord })
    : t("definition.dialog-title-empty");

  const position =
    typeof window === "undefined"
      ? { top: 100, left: 100 }
      : centeredDialogPosition({ top: window.innerHeight / 2, left: window.innerWidth / 2 }, 48);

  return (
    <Dialog
      key={open ? "open" : "closed"}
      open={open}
      onOpenChange={onOpenChange}
      draggable
      position={position}
      className={styles.dialog}
      {...rest}
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <DialogBody className={styles.body} data-no-drag>
        <div className={styles.search_row}>
          <SearchBar
            value={inputValue}
            onChange={(value: string) => setInputValue(value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSearch}
            placeholder={t("definition.placeholder")}
            aria-label={t("definition.placeholder")}
          />
        </div>
        {searchWord && (
          <div className={styles.results} data-no-drag>
            <Suspense fallback={null}>
              <DefinitionContent word={searchWord} />
            </Suspense>
          </div>
        )}
      </DialogBody>
      <DialogFooter>
        <Button
          variant="secondary"
          onClick={() => onOpenChange(false)}
          title={t("definition.close")}
          aria-label={t("definition.close")}
        >
          {t("definition.close")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DefinitionDialog;
