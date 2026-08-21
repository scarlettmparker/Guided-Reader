import { useTranslation } from "react-i18next";
import {
  Badge,
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import DiscordAvatar from "~/components/discord-avatar";
import type { PrivateNotesQuery } from "~/generated/graphql";
import styles from "./notes-author-toggle-dialog.module.css";

type NotesAuthorToggleDialogProps = {
  /**
   * Text id for the notes.
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
  /**
   * Currently hidden author ids.
   */
  hiddenAuthors: Set<string>;
  /**
   * Called when a toggle changes.
   */
  onToggle: (authorId: string, checked: boolean) => void;
};

/**
 * Dialog that toggles visibility of shared note authors.
 */
const NotesAuthorToggleDialog = (props: NotesAuthorToggleDialogProps) => {
  const { textId, open, onOpenChange, hiddenAuthors, onToggle } = props;
  const { t } = useTranslation("texts");
  const { data: notes } = usePageData<
    PrivateNotesQuery["hadesQueries"]["privateNotes"]["items"]
  >("privateNotes", "privateNotes/:textId", { textId });

  const map = new Map<
    string,
    {
      profile: PrivateNotesQuery["hadesQueries"]["privateNotes"]["items"][number]["authorProfile"];
      count: number;
    }
  >();
  for (const note of notes ?? []) {
    const authorId = note.authorProfile?.id ?? note.author?.id ?? "unknown";
    const current = map.get(authorId);
    if (current) {
      current.count += 1;
    } else {
      map.set(authorId, { profile: note.authorProfile, count: 1 });
    }
  }
  const groups = Array.from(map.entries());

  if (groups.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{t("notes-authors-title")}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <div className={styles.list}>
          {groups.map(([authorId, group]) => {
            const label =
              group.profile?.globalName ||
              group.profile?.discordUsername ||
              authorId;
            const checked = !hiddenAuthors.has(authorId);
            return (
              <label key={authorId} className={styles.item}>
                <Checkbox
                  checked={checked}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onToggle(authorId, e.target.checked)
                  }
                />
                {group.profile && (
                  <DiscordAvatar
                    discordId={group.profile.discordId}
                    avatar={group.profile.avatar}
                    size={24}
                  />
                )}
                <span className={styles.name}>{label}</span>
                <Badge className={styles.count}>{group.count}</Badge>
              </label>
            );
          })}
        </div>
      </DialogBody>
      <DialogFooter>
        <Button
          onClick={() => onOpenChange(false)}
          title={t("close")}
          aria-label={t("close")}
        >
          {t("close")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default NotesAuthorToggleDialog;
