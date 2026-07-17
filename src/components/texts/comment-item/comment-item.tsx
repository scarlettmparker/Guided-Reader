import { useState, useTransition } from "react";
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
import { TrashIcon } from "@heroicons/react/24/outline";
import { usePageData } from "@sun/ssr/react";
import DiscordAvatar from "~/components/discord-avatar";
import VoteControl from "~/components/vote-control";
import {
  deleteComment,
  removeVote,
  vote as castVote,
} from "~/server/actions/annotation";
import { CEFR_TO_KEY } from "~/utils/cefr";
import {
  ReaderVoteTarget,
  VoteValue,
  type ListCommentsQuery,
  type ReaderAccount,
} from "~/generated/graphql";
import styles from "./comment-item.module.css";

type Comment =
  ListCommentsQuery["hadesQueries"]["comments"]["items"][number];
type Profile = Comment["authorProfile"];
type LevelColours = Record<string, string>;

type CommentItemProps = {
  /**
   * The comment to render.
   */
  comment: Comment;
  /**
   * The resolved author profile, if found.
   */
  profile?: Profile;
  /**
   * CEFR level to colour map for badges.
   */
  colours?: LevelColours | null;
  /**
   * Parent annotation, used to invalidate its comment list on delete.
   */
  annotationId: string;
};

/**
 * A single reply on an annotation.
 */
const CommentItem = ({
  comment,
  profile,
  colours,
  annotationId,
}: CommentItemProps) => {
  const { t } = useTranslation("texts");
  const { data: currentUser } = usePageData<ReaderAccount | null>(
    "currentUser",
    "currentUser",
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const colour = profile?.cefrLevel
    ? colours?.[CEFR_TO_KEY[profile.cefrLevel]]
    : undefined;
  const isOwner =
    !!profile?.id && !!currentUser?.id && profile.id === currentUser.id;

  const confirmDelete = () => {
    startTransition(async () => {
      await deleteComment(comment.id, annotationId);
      setConfirmOpen(false);
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
        <span className={styles.author}>
          {profile?.globalName ?? profile?.discordUsername}
        </span>
        {profile?.cefrLevel && (
          <Badge
            variant="secondary"
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
                aria-label={t("comment-actions")}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setConfirmOpen(true)} asChild>
                <span className={styles.delete_action}>
                  <TrashIcon width={16} height={16} />
                  {t("delete")}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <MarkdownViewer className={styles.body}>{comment.body}</MarkdownViewer>
      <VoteControl
        myVote={comment.myVote ?? null}
        netScore={comment.netScore}
        onVoteChange={(next: VoteValue | null) =>
          next === null
            ? removeVote(ReaderVoteTarget.Comment, comment.id)
            : castVote(ReaderVoteTarget.Comment, comment.id, next)
        }
      />
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogHeader>
          <DialogTitle>{t("delete-comment-title")}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p>{t("delete-comment-body")}</p>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setConfirmOpen(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
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
