import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Badge, Button, MarkdownViewer, cn } from "@sun/components";
import DiscordAvatar from "~/components/discord-avatar";
import {
  vote as castVote,
  removeVote,
} from "~/server/actions/annotation";
import { CEFR_TO_KEY } from "~/utils/cefr";
import {
  ReaderVoteTarget,
  VoteValue,
  type CefrLevel,
  type ListCommentsQuery,
} from "~/generated/graphql";
import styles from "./comment-item.module.css";

type Comment = ListCommentsQuery["hadesQueries"]["comments"]["items"][number];

type AuthorProfile = {
  discordId: string;
  discordUsername?: string | null;
  globalName?: string | null;
  avatar?: string | null;
  cefrLevel?: CefrLevel | null;
};

type LevelColours = Record<string, string>;

type CommentItemProps = {
  /**
   * The comment to render.
   */
  comment: Comment;
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
 * A single reply on an annotation.
 */
const CommentItem = ({ comment, profile, colours }: CommentItemProps) => {
  const { t } = useTranslation("texts");
  const [myVote, setMyVote] = useState<VoteValue | null>(comment.myVote ?? null);
  const [pending, startTransition] = useTransition();
  const colour = profile?.cefrLevel
    ? colours?.[CEFR_TO_KEY[profile.cefrLevel]]
    : undefined;

  const apply = (next: VoteValue) => {
    startTransition(async () => {
      if (myVote === next) {
        await removeVote(ReaderVoteTarget.Comment, comment.id);
        setMyVote(null);
      } else {
        await castVote(ReaderVoteTarget.Comment, comment.id, next);
        setMyVote(next);
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
      <MarkdownViewer className={styles.body}>{comment.body}</MarkdownViewer>
      <div className={styles.vote}>
        <Button
          type="button"
          variant="ghost"
          title={t("vote-up")}
          aria-label={t("vote-up")}
          disabled={pending}
          onClick={() => apply(VoteValue.Up)}
        >
          <ThumbsUp
            size={16}
            className={cn(myVote === VoteValue.Up && styles.active)}
          />
        </Button>
        <span className={styles.score}>{comment.netScore}</span>
        <Button
          type="button"
          variant="ghost"
          title={t("vote-down")}
          aria-label={t("vote-down")}
          disabled={pending}
          onClick={() => apply(VoteValue.Down)}
        >
          <ThumbsDown
            size={16}
            className={cn(myVote === VoteValue.Down && styles.active)}
          />
        </Button>
      </div>
    </li>
  );
};

export default CommentItem;
