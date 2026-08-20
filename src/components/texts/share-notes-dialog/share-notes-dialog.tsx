import { Suspense, useEffect, useState, useTransition, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Badge,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  TaggedInput,
} from "@sun/components";
import { X } from "lucide-react";
import { shareNotes } from "~/server/actions/private-note";
import type { SearchReaderAccountsQuery } from "~/generated/graphql";
import SearchSuggestions from "./search-suggestions";
import styles from "./share-notes-dialog.module.css";

type ShareTag = {
  /**
   * Account id or email string.
   */
  id: string;
  /**
   * Display label.
   */
  label: string;
  /**
   * Whether this is an email.
   */
  isEmail: boolean;
};

type ShareNotesDialogProps = {
  /**
   * Text id whose notes are shared.
   */
  textId: string;
  /**
   * Whether the dialog is open.
   */
  open: boolean;
  /**
   * Called when open changes.
   */
  onOpenChange: (open: boolean) => void;
};



/**
 * Dialog to share all private notes on a text.
 */
const ShareNotesDialog = (props: ShareNotesDialogProps) => {
  const { textId, open, onOpenChange } = props;
  const { t } = useTranslation("texts");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [tags, setTags] = useState<ShareTag[]>([]);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 150);
    return () => clearTimeout(timer);
  }, [query]);

  const handleAddSuggestion = (account: SearchReaderAccountsQuery["hadesQueries"]["searchReaderAccounts"][number]) => {
    const label = account.globalName || account.discordUsername || account.gaiaAccountId;
    setTags([...tags, { id: account.gaiaAccountId, label, isEmail: false }]);
    setQuery("");
  };

  const handleAddEmail = (value: string) => {
    const exists = tags.some(
      (tag) => tag.id.toLowerCase() === value.toLowerCase(),
    );
    if (exists) return;
    setTags([...tags, { id: value, label: value, isEmail: true }]);
    setQuery("");
  };

  const handleRemove = (id: string) => {
    setTags(tags.filter((tag) => tag.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const trimmed = query.trim();
    if ((e.key === "Enter" || e.key === ",") && trimmed.includes("@")) {
      e.preventDefault();
      handleAddEmail(trimmed.replace(/,$/, ""));
    }
  };

  const handleShare = () => {
    const subjectIds = tags.filter((tag) => !tag.isEmail).map((tag) => tag.id);
    const subjectEmails = tags
      .filter((tag) => tag.isEmail)
      .map((tag) => tag.id);
    if (subjectIds.length === 0 && subjectEmails.length === 0) return;
    startTransition(async () => {
      await shareNotes({ textId, subjectIds, subjectEmails });
      setTags([]);
      setQuery("");
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{t("share-notes-title")}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <div className={styles.body}>
          <TaggedInput
            ref={inputRef}
            value={query}
            onChange={setQuery}
            onKeyDown={handleKeyDown}
            placeholder={t("share-notes-placeholder")}
          >
            {tags.map((tag) => (
              <Badge key={tag.id} variant="primary" className={styles.tag}>
                <span className={styles.tag_label}>{tag.label}</span>
                <Button
                  variant="secondary"
                  className={styles.tag_remove}
                  title={t("remove")}
                  aria-label={t("remove")}
                  onClick={() => handleRemove(tag.id)}
                >
                  <X width={12} height={12} />
                </Button>
              </Badge>
            ))}
          </TaggedInput>
          <Suspense fallback={null}>
            <SearchSuggestions query={debouncedQuery} tags={tags} onAdd={handleAddSuggestion} />
          </Suspense>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button
          variant="secondary"
          onClick={() => onOpenChange(false)}
          title={t("cancel")}
          aria-label={t("cancel")}
        >
          {t("cancel")}
        </Button>
        <Button
          onClick={handleShare}
          disabled={pending || tags.length === 0}
          title={t("share")}
          aria-label={t("share")}
        >
          {t("share")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ShareNotesDialog;
