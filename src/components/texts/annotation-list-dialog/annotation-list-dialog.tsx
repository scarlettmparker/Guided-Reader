import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { EllipsisVerticalIcon } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  DialogBody,
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
import VoteControl from "~/components/vote-control";
import AnnotationConfirmDeleteDialog from "../annotation-confirm-delete-dialog";
import { CEFR_TO_KEY } from "~/utils/cefr";
import {
  type ListAnnotationsQuery,
  type ReaderAccount,
} from "~/generated/graphql";
import styles from "./annotation-list-dialog.module.css";
import { TrashIcon } from "@heroicons/react/24/outline";

type Annotation = ListAnnotationsQuery["hadesQueries"]["annotations"][number];

type LevelColours = Record<string, string>;

/**
 * List-dialog state owned by the annotation layer.
 */
export type AnnotationListState = {
  /**
   * Whether the dialog is open.
   */
  open: boolean;
  /**
   * Initial screen position for the draggable dialog.
   */
  position: { top: number; left: number };
  /**
   * The text the annotations belong to.
   */
  textId: string;
  /**
   * The position whose annotations are shown.
   */
  positionId: string;
};

type AnnotationListDialogProps = {
  /**
   * Dialog open state, screen position, and the position being viewed.
   */
  list: AnnotationListState;
  /**
   * The live annotations for the position (refetches after mutations).
   */
  annotations: Annotation[];
  /**
   * Called when the open state changes.
   */
  onOpenChange: (open: boolean) => void;
};

/**
 * Draggable dialog listing the annotations for a single position.
 */
const AnnotationListDialog = ({
  list,
  annotations,
  onOpenChange,
}: AnnotationListDialogProps) => {
  const { t } = useTranslation("texts");
  const { data: colours } = usePageData<LevelColours | null>(
    "levelColours",
    "levelColours",
  );
  const { data: currentUser } = usePageData<ReaderAccount | null>(
    "currentUser",
    "currentUser",
  );
  const { open, position, textId } = list;
  const [items, setItems] = useState<Annotation[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Annotation | null>(null);

  /**
   * Keeps the local list in sync when a different position is opened.
   */
  useEffect(() => {
    setItems([...annotations].sort((a, b) => b.netScore - a.netScore));
  }, [annotations]);

  /**
   * Applies a vote change to one annotation and re-sorts the list by score.
   */
  const handleVoted = (id: string, netScore: number) => {
    setItems((prev) =>
      [...prev]
        .map((item) => (item.id === id ? { ...item, netScore } : item))
        .sort((a, b) => b.netScore - a.netScore),
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      draggable
      position={position}
    >
      <DialogHeader>
        <DialogTitle>{t("annotations")}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        {items.length === 0 ? (
          <p className={styles.empty}>{t("no-annotations")}</p>
        ) : (
          <ul className={styles.list}>
            {items.map((annotation) => {
              const author = annotation.author;
              const colour = author?.cefrLevel
                ? colours?.[CEFR_TO_KEY[author.cefrLevel]]
                : undefined;
              const isOwner =
                !!author?.id &&
                !!currentUser?.id &&
                author.id === currentUser.id;
              return (
                <li key={annotation.id} className={styles.annotation}>
                  <div className={styles.header}>
                    <DiscordAvatar
                      discordId={author?.discordId ?? ""}
                      avatar={author?.avatar}
                      size={28}
                      alt={author?.globalName ?? author?.discordUsername ?? ""}
                    />
                    <span className={styles.author}>
                      {author?.globalName ?? author?.discordUsername}
                    </span>
                    {author?.cefrLevel && (
                      <Badge
                        variant="secondary"
                        className={styles.level}
                        style={colour ? { backgroundColor: colour } : undefined}
                      >
                        {author.cefrLevel}
                      </Badge>
                    )}
                    {isOwner && (
                      <DropdownMenu className={styles.menu_trigger}>
                        <DropdownMenuTrigger asChild>
                          <EllipsisVerticalIcon
                            width={16}
                            height={16}
                            aria-label={t("annotation-actions")}
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(annotation)}
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
                    {annotation.body}
                  </MarkdownViewer>
                  <VoteControl
                    annotation={annotation}
                    onVoted={(netScore) => handleVoted(annotation.id, netScore)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </DialogBody>

      <AnnotationConfirmDeleteDialog
        target={deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        textId={textId}
      />
    </Dialog>
  );
};

export default AnnotationListDialog;
