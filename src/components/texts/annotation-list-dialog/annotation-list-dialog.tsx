import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Badge,
  Dialog,
  DialogBody,
  DialogHeader,
  DialogTitle,
  MarkdownViewer,
} from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import DiscordAvatar from "~/components/discord-avatar";
import VoteControl from "~/components/vote-control";
import { CEFR_TO_KEY } from "~/utils/cefr";
import {
  ReaderVoteTarget,
  type ListAnnotationsQuery,
} from "~/generated/graphql";
import styles from "./annotation-list-dialog.module.css";

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
   * The annotations sharing the clicked position.
   */
  annotations: Annotation[];
};

type AnnotationListDialogProps = {
  /**
   * Dialog open state, screen position, and the annotations to show.
   */
  list: AnnotationListState;
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
  onOpenChange,
}: AnnotationListDialogProps) => {
  const { t } = useTranslation("texts");
  const { data: colours } = usePageData<LevelColours | null>(
    "levelColours",
    "levelColours",
  );
  const { open, position, annotations } = list;
  const [items, setItems] = useState<Annotation[]>([]);

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
                  </div>
                  <MarkdownViewer className={styles.body}>
                    {annotation.body}
                  </MarkdownViewer>
                  <VoteControl
                    targetType={ReaderVoteTarget.Annotation}
                    targetId={annotation.id}
                    netScore={annotation.netScore}
                    onVoted={(_vote, netScore) =>
                      handleVoted(annotation.id, netScore)
                    }
                  />
                </li>
              );
            })}
          </ul>
        )}
      </DialogBody>
    </Dialog>
  );
};

export default AnnotationListDialog;
