import { useState, useTransition } from "react";
import { EllipsisVerticalIcon } from "lucide-react";
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
import { TrashIcon } from "@heroicons/react/24/outline";
import { usePageData } from "@sun/ssr/react";
import DiscordAvatar from "~/components/discord-avatar";
import VoteControl from "~/components/vote-control";
import { deletePost, removePostVote, votePost } from "~/server/actions/forum";
import { CEFR_TO_KEY } from "~/utils/cefr";
import {
  VoteValue,
  type ListPostsQuery,
  type ReaderAccount,
} from "~/generated/graphql";
import styles from "./forum-post-item.module.css";

type Post = ListPostsQuery["icarusQueries"]["posts"]["items"][number];
type Profile = Post["authorProfile"];
type LevelColours = Record<string, string>;

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
   * CEFR level to colour map for badges.
   */
  colours?: LevelColours | null;
  /**
   * Parent thread, used to invalidate its post list on delete.
   */
  threadId: string;
};

/**
 * A single comment on a text discussion.
 */
const ForumPostItem = ({
  post,
  profile,
  colours,
  threadId,
}: ForumPostItemProps) => {
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
      await deletePost(post.id, threadId);
      setConfirmOpen(false);
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
      <MarkdownViewer className={styles.body}>{post.body}</MarkdownViewer>
      <VoteControl
        myVote={post.myVote ?? null}
        netScore={post.netScore}
        onVoteChange={(next: VoteValue | null) =>
          next === null ? removePostVote(post.id) : votePost(post.id, next)
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

export default ForumPostItem;
