import { useState, useTransition, useRef } from "react";
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
import { usePageData } from "@sun/ssr/react";
import { shareNotes } from "~/server/actions/private-note";
import DiscordAvatar from "~/components/discord-avatar";
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
  const [tags, setTags] = useState<ShareTag[]>([]);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();
  const { data: accounts } = usePageData<{
    accounts: {
      id: string;
      discordId: string;
      globalName: string | null;
      discordUsername: string | null;
      avatar: string | null;
    }[];
  }>(
    "accounts",
    "searchReaderAccounts/:query",
    trimmed ? { query: trimmed } : { query: "" },
  );

  const suggestions = trimmed
    ? (accounts ?? [])
        .filter((a) => !tags.some((tag) => tag.id === a.id))
        .slice(0, 5)
    : [];

  const handleAddSuggestion = (account: {
    id: string;
    discordId: string;
    globalName: string | null;
    discordUsername: string | null;
  }) => {
    const label = account.globalName || account.discordUsername || account.id;
    setTags([...tags, { id: account.id, label, isEmail: false }]);
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
              <Badge key={tag.id} variant="secondary" className={styles.tag}>
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
          {suggestions.length > 0 && (
            <div className={styles.suggestions}>
              {suggestions.map((account) => (
                <Button
                  key={account.id}
                  variant="secondary"
                  className={styles.suggestion}
                  title={account.globalName || account.discordUsername || ""}
                  aria-label={
                    account.globalName || account.discordUsername || ""
                  }
                  onClick={() => handleAddSuggestion(account)}
                >
                  <DiscordAvatar
                    discordId={account.discordId}
                    avatar={account.avatar}
                    size={24}
                  />
                  <span className={styles.suggestion_label}>
                    {account.globalName || account.discordUsername}
                  </span>
                </Button>
              ))}
            </div>
          )}
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
