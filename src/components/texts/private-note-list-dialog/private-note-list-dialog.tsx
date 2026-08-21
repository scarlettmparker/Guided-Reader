import { useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { EllipsisVerticalIcon } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  MarkdownViewer,
} from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import DiscordAvatar from "~/components/discord-avatar";
import { CEFR_TO_KEY } from "~/utils/cefr";
import { deletePrivateNote } from "~/server/actions/private-note";
import type { PrivateNotesQuery, ReaderAccount } from "~/generated/graphql";
import styles from "./private-note-list-dialog.module.css";
import { TrashIcon } from "@heroicons/react/24/outline";

type PrivateNote =
  PrivateNotesQuery["hadesQueries"]["privateNotes"]["items"][number];

type LevelColours = Record<string, string>;

const TITLE_SNIPPET_LIMIT = 60;

/**
 * List-dialog state owned by the annotation layer for private notes.
 */
export type PrivateNoteListState = {
  /**
   * Whether the dialog is open.
   */
  open: boolean;
  /**
   * Initial screen position for the draggable dialog.
   */
  position: { top: number; left: number };
  /**
   * The text the notes belong to.
   */
  textId: string;
  /**
   * The start offset of the position being viewed.
   */
  startOffset: number;
  /**
   * The end offset of the position being viewed.
   */
  endOffset: number;
  /**
   * The annotated text snippet, shown in the dialog title.
   */
  snippet: string;
};

type PrivateNoteListDialogProps = {
  /**
   * Dialog open state, screen position, and the position being viewed.
   */
  list: PrivateNoteListState;
  /**
   * The live notes for the position.
   */
  notes: PrivateNote[];
  /**
   * Called when the open state changes.
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Called when the reader wants to add another note at this position.
   */
  onSuggestNote?: () => void;
};

/**
 * Draggable dialog listing the private notes for a single position, identical
 * layout to the annotation list dialog for future shared ownership and cascade
 * sharing.
 */
const PrivateNoteListDialog = ({
  list,
  notes,
  onOpenChange,
  onSuggestNote,
}: PrivateNoteListDialogProps) => {
  const { t } = useTranslation("texts");
  const { data: colours } = usePageData<LevelColours | null>(
    "levelColours",
    "levelColours",
  );
  const { data: currentUser } = usePageData<ReaderAccount | null>(
    "currentUser",
    "currentUser",
  );
  const { open, position, textId, snippet } = list;
  const [items, setItems] = useState<PrivateNote[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<PrivateNote | null>(null);
  const [pending, startTransition] = useTransition();

  const titleSnippet =
    snippet.length > TITLE_SNIPPET_LIMIT
      ? `${snippet.slice(0, TITLE_SNIPPET_LIMIT)}…`
      : snippet;

  /**
   * Keeps the local list in sync when a different position is opened.
   */
  useEffect(() => {
    setItems(
      [...notes].sort((a, b) => {
        const aTime = a.createdAt
          ? new Date(a.createdAt as string).getTime()
          : 0;
        const bTime = b.createdAt
          ? new Date(b.createdAt as string).getTime()
          : 0;
        return bTime - aTime;
      }),
    );
  }, [notes]);

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      await deletePrivateNote(deleteTarget.id, textId);
      setDeleteTarget(null);
    });
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        draggable
        position={position}
      >
        <DialogHeader>
          <DialogTitle>{t("notes-for", { snippet: titleSnippet })}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {items.length === 0 ? (
            <p className={styles.empty}>{t("no-notes")}</p>
          ) : (
            <ul className={styles.list}>
              {items.map((note) => {
                const profile = note.authorProfile;
                const colour = profile?.cefrLevel
                  ? colours?.[CEFR_TO_KEY[profile.cefrLevel]]
                  : undefined;
                const isOwner =
                  !!profile?.id &&
                  !!currentUser?.id &&
                  profile.id === currentUser.id;
                return (
                  <li key={note.id} className={styles.annotation}>
                    <div
                      className={styles.header}
                      title={
                        note.createdAt
                          ? new Date(note.createdAt as string).toLocaleString()
                          : undefined
                      }
                    >
                      <DiscordAvatar
                        discordId={profile?.discordId ?? note.author?.id ?? ""}
                        avatar={profile?.avatar}
                        size={28}
                        alt={
                          profile?.globalName ?? profile?.discordUsername ?? ""
                        }
                      />
                      <span className={styles.author}>
                        {profile?.globalName ??
                          profile?.discordUsername ??
                          t("unknown")}
                      </span>
                      {profile?.cefrLevel && (
                        <Badge
                          className={styles.level}
                          style={
                            colour ? { backgroundColor: colour } : undefined
                          }
                        >
                          {profile.cefrLevel}
                        </Badge>
                      )}
                      {isOwner && (
                        <DropdownMenu className={styles.menu_trigger}>
                          <DropdownMenuTrigger asChild>
                            <EllipsisVerticalIcon
                              width={16}
                              height={16}
                              aria-label={t("private-note-actions")}
                            />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(note)}
                              asChild
                            >
                              <span className={styles.delete_action}>
                                <TrashIcon width={16} height={16} />
                                {t("delete")}
                              </span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <MarkdownViewer className={styles.body}>
                      {note.body}
                    </MarkdownViewer>
                  </li>
                );
              })}
            </ul>
          )}
        </DialogBody>
        {onSuggestNote && (
          <DialogFooter className={styles.footer}>
            <Button type="button" variant="secondary" onClick={onSuggestNote}>
              {t("add-another-note")}
            </Button>
          </DialogFooter>
        )}
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o: boolean) => !o && setDeleteTarget(null)}
      >
        <DialogHeader>
          <DialogTitle>{t("delete-private-note-title")}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p>{t("delete-private-note-body")}</p>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => setDeleteTarget(null)}
            title={t("cancel")}
            aria-label={t("cancel")}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleDelete}
            disabled={pending}
            title={t("delete")}
            aria-label={t("delete")}
          >
            {t("delete")}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default PrivateNoteListDialog;
