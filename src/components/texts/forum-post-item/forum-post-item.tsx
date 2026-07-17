import { useState, useTransition } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Badge, Button, MarkdownViewer, cn } from "@sun/components";
import DiscordAvatar from "~/components/discord-avatar";
import { votePost, removePostVote } from "~/server/actions/forum";
import { CEFR_TO_KEY } from "~/utils/cefr";
import {
  VoteValue,
  type CefrLevel,
  type ListPostsQuery,
} from "~/generated/graphql";
import styles from "./forum-post-item.module.css";

type Post = ListPostsQuery["icarusQueries"]["posts"]["items"][number];

type AuthorProfile = {
  discordId: string;
  discordUsername?: string | null;
  globalName?: string | null;
  avatar?: string | null;
  cefrLevel?: CefrLevel | null;
};

type LevelColours = Record<string, string>;

type ForumPostItemProps = {
  /**
   * The post to render.
   */
  post: Post;
  /**
   * The resolved author profile, if found.
   */
  profile?: AuthorProfile;
  /**
   * CEFR level → colour map for badges.
   */
  colours?: LevelColours | null;
};

/**
 * A single post in a text-level discussion thread.
 */
const ForumPostItem = ({ post, profile, colours }: ForumPostItemProps) => {
  const [myVote, setMyVote] = useState<VoteValue | null>(post.myVote ?? null);
  const [pending, startTransition] = useTransition();
  const colour = profile?.cefrLevel
    ? colours?.[CEFR_TO_KEY[profile.cefrLevel]]
    : undefined;

  const apply = (next: VoteValue) => {
    startTransition(async () => {
      if (myVote === next) {
        await removePostVote(post.id);
        setMyVote(null);
      } else {
        await votePost(post.id, next);
        setMyVote(next);
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
          <Badge
            variant="secondary"
            style={colour ? { backgroundColor: colour } : undefined}
          >
            {profile.cefrLevel}
          </Badge>
        )}
      </div>
      <MarkdownViewer className={styles.body}>{post.body}</MarkdownViewer>
      <div className={styles.vote}>
        <Button
          type="button"
          variant="ghost"
          aria-label="vote up"
          disabled={pending}
          onClick={() => apply(VoteValue.Up)}
        >
          <ThumbsUp size={16} className={cn(myVote === VoteValue.Up && styles.active)} />
        </Button>
        <span className={styles.score}>{post.netScore}</span>
        <Button
          type="button"
          variant="ghost"
          aria-label="vote down"
          disabled={pending}
          onClick={() => apply(VoteValue.Down)}
        >
          <ThumbsDown size={16} className={cn(myVote === VoteValue.Down && styles.active)} />
        </Button>
      </div>
    </li>
  );
};

export default ForumPostItem;
