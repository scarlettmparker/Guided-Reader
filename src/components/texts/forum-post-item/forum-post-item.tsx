import { useState, useTransition } from "react";
import { EllipsisVerticalIcon } from "lucide-preact";
import { useTranslation } from "react-i18next";
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
import { deletePost, removePostVote, votePost } from "~/server/actions/forum";
import { CEFR_TO_KEY } from "~/utils/cefr";
import { voteScoreDelta } from "~/utils/vote-score";
import {
  VoteValue,
  type ListPostsQuery,
  type ReaderAccount,
  type RemoveVoteResponse,
  type VoteForumResponse,
} from "~/generated/graphql";
import styles from "./forum-post-item.module.css";

type Post = ListPostsQuery["icarusQueries"]["posts"]["items"][number];
type Profile = Post["authorProfile"];
type LevelColours = Record<string, string>;

type VotePayload = {
  /**
   * Post being voted on.
   */
  targetId: string;
  /**
   * Next vote value; null removes the vote.
   */
  next: VoteValue | null;
};

type ForumPostItemProps = {
  /**
   * The post to render.
   */
  post: Post;
  /**
   * The resolved author profile, if found.
   */
  profile?: Profile;
  /**
   * Parent thread, used to update its post list on delete.
   */
  threadId: string;
};

/**
 * A single comment on a text discussion.
 */
const ForumPostItem = ({ post, profile, threadId }: ForumPostItemProps) => {
  const { t } = useTranslation("texts");
  const { data: currentUser } = usePageData<ReaderAccount | null>(
    "currentUser",
    "currentUser",
  );
  const { data: colours } = usePageData<LevelColours | null>(
    "levelColours",
    "levelColours",
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletePending, startDelete] = useTransition();

  const [optimisticPost, runVote, votePending] = useMutation<
    VotePayload,
    VoteForumResponse | RemoveVoteResponse,
    Post
  >({
    base: post,
    reducer: (current, payload) => ({
      ...current,
      myVote: payload.next,
      netScore:
        current.netScore + voteScoreDelta(current.myVote, payload.next),
    }),
    action: (payload) =>
      payload.next === null
        ? removePostVote(payload.targetId)
        : votePost(payload.targetId, payload.next),
    onSuccess: (response) => {
      const entity = response.post;
      patchPageData<Post[]>(
        "posts",
        "threads/:threadId",
        { threadId },
        (current) =>
          (current ?? []).map((item) =>
            item.id === entity.id ? { ...item, ...entity } : item,
          ),
      );
    },
  });

  const colour = profile?.cefrLevel
    ? colours?.[CEFR_TO_KEY[profile.cefrLevel]]
    : undefined;
  const isOwner =
    !!profile?.id && !!currentUser?.id && profile.id === currentUser.id;

  const confirmDelete = () => {
    startDelete(async () => {
      try {
        const response = await deletePost(optimisticPost.id);
        patchPageData<Post[]>(
          "posts",
          "threads/:threadId",
          { threadId },
          (current) =>
            (current ?? []).filter((item) => item.id !== response.id),
        );
      } finally {
        setConfirmOpen(false);
      }
    });
  };

  return (
    <li className={styles.post}>
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
          <Badge style={colour ? { backgroundColor: colour } : undefined}>
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
      <MarkdownViewer className={styles.body}>
        {optimisticPost.body}
      </MarkdownViewer>
      <VoteControl
        myVote={optimisticPost.myVote ?? null}
        netScore={optimisticPost.netScore}
        pending={votePending}
        onVoteChange={(next) => runVote({ targetId: optimisticPost.id, next })}
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

export default ForumPostItem;
