import { useMemo, useState } from "react";
import { useTranslation } from "@sun/i18n";
import { EllipsisVerticalIcon } from "lucide-preact";
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
import { usePageData, useMutation } from "@sun/ssr/react";
import { patchPageData } from "@sun/ssr";
import DiscordAvatar from "~/components/discord-avatar";
import VoteControl from "~/components/vote-control";
import AnnotationDiscussion from "../annotation-discussion";
import AnnotationConfirmDeleteDialog from "../annotation-confirm-delete-dialog";
import { removeVote, vote as castVote } from "~/server/actions/annotation";
import { CEFR_TO_KEY } from "~/utils/cefr";
import { voteScoreDelta } from "~/utils/vote-score";
import {
  ReaderVoteTarget,
  VoteValue,
  type ListAnnotationsQuery,
  type ReaderAccount,
  type VoteReaderResponse,
} from "~/generated/graphql";
import styles from "./annotation-list-dialog.module.css";
import { TrashOutline } from "preact-heroicons";

type Annotation = ListAnnotationsQuery["hadesQueries"]["annotations"]["items"][number];

type LevelColours = Record<string, string>;

type VotePayload = {
  /**
   * Annotation being voted on.
   */
  targetId: string;
  /**
   * Next vote value; null removes the vote.
   */
  next: VoteValue | null;
};

const TITLE_SNIPPET_LIMIT = 60;

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
  /**
   * The annotated text snippet, shown in the dialog title.
   */
  snippet: string;
};

type AnnotationListDialogProps = {
  /**
   * Dialog open state, screen position, and the position being viewed.
   */
  list: AnnotationListState;
  /**
   * The live annotations for the position.
   */
  annotations: Annotation[];
  /**
   * Called when the open state changes.
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Called when the reader wants to add their own annotation at this position.
   */
  onSuggestAnnotation?: () => void;
};

/**
 * Draggable dialog listing the annotations for a single position.
 */
const AnnotationListDialog = ({
  list,
  annotations,
  onOpenChange,
  onSuggestAnnotation,
}: AnnotationListDialogProps) => {
  const { t } = useTranslation("texts");
  const { data: colours } = usePageData<LevelColours | null>("levelColours", "levelColours");
  const { data: currentUser } = usePageData<ReaderAccount | null>("currentUser", "currentUser");
  const { open, position, textId, snippet } = list;
  const [deleteTarget, setDeleteTarget] = useState<Annotation | null>(null);
  const [replyOpenId, setReplyOpenId] = useState<string | null>(null);

  const titleSnippet =
    snippet.length > TITLE_SNIPPET_LIMIT ? `${snippet.slice(0, TITLE_SNIPPET_LIMIT)}…` : snippet;

  const sorted = useMemo(
    () => [...annotations].sort((a, b) => b.netScore - a.netScore),
    [annotations],
  );

  const [items, runVote, votePending] = useMutation<VotePayload, VoteReaderResponse, Annotation[]>({
    base: sorted,
    reducer: (current, payload) =>
      current
        .map((item) =>
          item.id === payload.targetId
            ? {
                ...item,
                myVote: payload.next,
                netScore: item.netScore + voteScoreDelta(item.myVote, payload.next),
              }
            : item,
        )
        .sort((a, b) => b.netScore - a.netScore),
    action: (payload) =>
      payload.next === null
        ? removeVote(ReaderVoteTarget.Annotation, payload.targetId)
        : castVote(ReaderVoteTarget.Annotation, payload.targetId, payload.next),
    onSuccess: (response) => {
      const entity = response.annotation;
      if (entity == null) return;
      patchPageData<Annotation[]>("annotations", "texts/:id", { id: textId }, (current) =>
        (current ?? []).map((item) => (item.id === entity.id ? { ...item, ...entity } : item)),
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} draggable position={position}>
      <DialogHeader>
        <DialogTitle>{t("annotations-for", { snippet: titleSnippet })}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        {items.length === 0 ? (
          <p className={styles.empty}>{t("no-annotations")}</p>
        ) : (
          <ul className={styles.list}>
            {items.map((annotation) => {
              const profile = annotation.authorProfile;
              const colour = profile?.cefrLevel
                ? colours?.[CEFR_TO_KEY[profile.cefrLevel]]
                : undefined;
              const isOwner = !!profile?.id && !!currentUser?.id && profile.id === currentUser.id;
              const toggleReply = () =>
                setReplyOpenId((current) => (current === annotation.id ? null : annotation.id));
              return (
                <li key={annotation.id} className={styles.annotation}>
                  <div
                    className={styles.header}
                    title={
                      annotation.createdAt
                        ? new Date(annotation.createdAt as string).toLocaleString()
                        : undefined
                    }
                  >
                    <DiscordAvatar
                      discordId={profile?.discordId ?? ""}
                      avatar={profile?.avatar}
                      size={28}
                      alt={profile?.globalName ?? profile?.discordUsername ?? ""}
                    />
                    <span className={styles.author}>
                      {profile?.globalName ?? profile?.discordUsername}
                    </span>
                    {profile?.cefrLevel && (
                      <Badge
                        className={styles.level}
                        style={colour ? { backgroundColor: colour } : undefined}
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
                            aria-label={t("annotation-actions")}
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setDeleteTarget(annotation)} asChild>
                            <span className={styles.delete_action}>
                              <TrashOutline width={16} height={16} />
                              {t("delete")}
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <MarkdownViewer className={styles.body}>{annotation.body}</MarkdownViewer>
                  <div className={styles.actions_row}>
                    <VoteControl
                      myVote={annotation.myVote ?? null}
                      netScore={annotation.netScore}
                      pending={votePending}
                      onVoteChange={(next) => runVote({ targetId: annotation.id, next })}
                    />
                    <a onClick={toggleReply}>{t("reply-action")}</a>
                  </div>
                  <AnnotationDiscussion
                    annotationId={annotation.id}
                    replyCount={annotation.replyCount}
                    textId={textId}
                    composerOpen={replyOpenId === annotation.id}
                    onComposerOpenChange={(open) => setReplyOpenId(open ? annotation.id : null)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </DialogBody>
      {onSuggestAnnotation && (
        <DialogFooter className={styles.footer}>
          <Button type="button" variant="secondary" onClick={onSuggestAnnotation}>
            {t("suggest-own-annotation")}
          </Button>
        </DialogFooter>
      )}

      <AnnotationConfirmDeleteDialog
        target={deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        textId={textId}
      />
    </Dialog>
  );
};

export default AnnotationListDialog;
