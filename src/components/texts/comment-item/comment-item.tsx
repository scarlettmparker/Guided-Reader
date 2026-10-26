import { useState, useTransition } from "react";
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
import { TrashOutline } from "preact-heroicons";
import { usePageData, useMutation } from "@sun/ssr/react";
import { patchPageData } from "@sun/ssr";
import DiscordAvatar from "~/components/discord-avatar";
import VoteControl from "~/components/vote-control";
import { deleteComment, removeVote, vote as castVote } from "~/server/actions/annotation";
import { CEFR_TO_KEY } from "~/utils/cefr";
import { voteScoreDelta } from "~/utils/vote-score";
import {
  ReaderVoteTarget,
  VoteValue,
  type ListAnnotationsQuery,
  type ListCommentsQuery,
  type ReaderAccount,
  type VoteReaderResponse,
} from "~/generated/graphql";
import styles from "./comment-item.module.css";

type Comment = ListCommentsQuery["hadesQueries"]["comments"]["items"][number];
type Annotation = ListAnnotationsQuery["hadesQueries"]["annotations"]["items"][number];
type LevelColours = Record<string, string>;

type VotePayload = {
  /**
   * Comment being voted on.
   */
  targetId: string;
  /**
   * Next vote value; null removes the vote.
   */
  next: VoteValue | null;
};

type CommentItemProps = {
  /**
   * The comment to render.
   */
  comment: Comment;
  /**
   * Parent annotation, used to update its reply count on delete.
   */
  annotationId: string;
  /**
   * Owning text, used to update the annotation reply count on delete.
   */
  textId: string;
};

/**
 * A single reply on an annotation.
 */
const CommentItem = ({ comment, annotationId, textId }: CommentItemProps) => {
  const { t } = useTranslation("texts");
  const { data: currentUser } = usePageData<ReaderAccount | null>("currentUser", "currentUser");
  const { data: colours } = usePageData<LevelColours | null>("levelColours", "levelColours");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletePending, startDelete] = useTransition();

  const [optimisticComment, runVote, votePending] = useMutation<
    VotePayload,
    VoteReaderResponse,
    Comment
  >({
    base: comment,
    reducer: (current, payload) => ({
      ...current,
      myVote: payload.next,
      netScore: current.netScore + voteScoreDelta(current.myVote, payload.next),
    }),
    action: (payload) =>
      payload.next === null
        ? removeVote(ReaderVoteTarget.Comment, payload.targetId)
        : castVote(ReaderVoteTarget.Comment, payload.targetId, payload.next),
    onSuccess: (response) => {
      const entity = response.comment;
      if (entity == null) return;
      patchPageData<Comment[]>(
        "comments",
        "annotations/:annotationId",
        { annotationId },
        (current) =>
          (current ?? []).map((item) =>
            item.id === entity.id
              ? {
                  ...item,
                  myVote: entity.myVote,
                  netScore: entity.netScore,
                  upvotes: entity.upvotes,
                  downvotes: entity.downvotes,
                }
              : item,
          ),
      );
    },
  });

  const profile = optimisticComment.authorProfile;
  const colour = profile?.cefrLevel ? colours?.[CEFR_TO_KEY[profile.cefrLevel]] : undefined;
  const isOwner = !!profile?.id && !!currentUser?.id && profile.id === currentUser.id;

  const confirmDelete = () => {
    startDelete(async () => {
      try {
        const response = await deleteComment(optimisticComment.id);
        patchPageData<Comment[]>(
          "comments",
          "annotations/:annotationId",
          { annotationId },
          (current) => (current ?? []).filter((item) => item.id !== response.id),
        );
        patchPageData<Annotation[]>("annotations", "texts/:id", { id: textId }, (current) =>
          (current ?? []).map((item) =>
            item.id === annotationId
              ? { ...item, replyCount: Math.max(0, item.replyCount - 1) }
              : item,
          ),
        );
      } finally {
        setConfirmOpen(false);
      }
    });
  };

  return (
    <li className={styles.comment}>
      <div className={styles.header}>
        <DiscordAvatar
          discordId={profile?.discordId ?? ""}
          avatar={profile?.avatar}
          size={24}
          alt={profile?.globalName ?? profile?.discordUsername ?? ""}
        />
        <span className={styles.author}>{profile?.globalName ?? profile?.discordUsername}</span>
        {profile?.cefrLevel && (
          <Badge style={colour ? { backgroundColor: colour } : undefined}>
            {profile.cefrLevel}
          </Badge>
        )}
        {isOwner && (
          <DropdownMenu className={styles.menu_trigger}>
            <DropdownMenuTrigger asChild>
              <EllipsisVerticalIcon width={16} height={16} aria-label={t("comment-actions")} />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setConfirmOpen(true)} asChild>
                <span className={styles.delete_action}>
                  <TrashOutline width={16} height={16} />
                  {t("delete")}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <MarkdownViewer className={styles.body}>{optimisticComment.body}</MarkdownViewer>
      <VoteControl
        myVote={optimisticComment.myVote ?? null}
        netScore={optimisticComment.netScore}
        pending={votePending}
        onVoteChange={(next) => runVote({ targetId: optimisticComment.id, next })}
      />
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogHeader>
          <DialogTitle>{t("delete-comment-title")}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p>{t("delete-comment-body")}</p>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setConfirmOpen(false)}>
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deletePending}
            onClick={confirmDelete}
          >
            {t("delete")}
          </Button>
        </DialogFooter>
      </Dialog>
    </li>
  );
};

export default CommentItem;
