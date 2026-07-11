import { useTransition, useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@sun/components";
import { vote as castVote, removeVote as removeMyVote } from "~/server/actions/annotation";
import {
  ReaderVoteTarget,
  VoteValue,
} from "~/generated/graphql";
import styles from "./vote-control.module.css";

type VoteControlProps = {
  /**
   * The kind of target being voted on.
   */
  targetType: ReaderVoteTarget;
  /**
   * The id of the target being voted on.
   */
  targetId: string;
  /**
   * The current net score (upvotes - downvotes).
   */
  netScore: number;
  /**
   * The caller's existing vote, if known. Unknown when the listing query does
   * not return it; the control then tracks vote state from the first click.
   */
  myVote?: VoteValue | null;
  /**
   * Called after a successful vote change with the new vote value and the
   * resulting net score, so the parent can re-sort and re-render.
   */
  onVoted?: (vote: VoteValue | null, netScore: number) => void;
};

/**
 * Up/down vote control for annotations and comments. Tracks vote state locally
 * and mutates via the registered hades vote handlers.
 */
const VoteControl = ({
  targetType,
  targetId,
  netScore,
  myVote,
  onVoted,
}: VoteControlProps) => {
  const { t } = useTranslation("texts");
  const [vote, setVote] = useState<VoteValue | null>(myVote ?? null);
  const [score, setScore] = useState(netScore);
  const [pending, startTransition] = useTransition();

  /**
   * Applies a vote change: casts or removes the caller's vote and updates the
   * optimistic score, notifying the parent of the new state.
   */
  const applyVote = (next: VoteValue | null) => {
    const delta =
      next === null
        ? vote === VoteValue.Up
          ? -1
          : 1
        : next === VoteValue.Up
          ? vote === VoteValue.Up
            ? 0
            : vote === VoteValue.Down
              ? 2
              : 1
          : vote === VoteValue.Down
            ? 0
            : vote === VoteValue.Up
              ? -2
              : -1;
    const nextScore = score + delta;
    setVote(next);
    setScore(nextScore);
    onVoted?.(next, nextScore);
    startTransition(async () => {
      const result =
        next === null
          ? await removeMyVote(targetType, targetId)
          : await castVote(targetType, targetId, next);
      if (result.__typename !== "QuerySuccess") {
        setVote(vote);
        setScore(score);
        onVoted?.(vote, score);
      }
    });
  };

  const handleUp = () => applyVote(vote === VoteValue.Up ? null : VoteValue.Up);
  const handleDown = () =>
    applyVote(vote === VoteValue.Down ? null : VoteValue.Down);

  return (
    <div className={styles.vote_control}>
      <Button
        type="button"
        variant="secondary"
        className={
          vote === VoteValue.Up ? styles.vote_button_active : undefined
        }
        title={t("vote-up")}
        aria-label={t("vote-up")}
        aria-pressed={vote === VoteValue.Up}
        disabled={pending}
        onClick={handleUp}
      >
        <ThumbsUp />
      </Button>
      <span className={styles.score}>{score}</span>
      <Button
        type="button"
        variant="secondary"
        className={
          vote === VoteValue.Down ? styles.vote_button_active : undefined
        }
        title={t("vote-down")}
        aria-label={t("vote-down")}
        aria-pressed={vote === VoteValue.Down}
        disabled={pending}
        onClick={handleDown}
      >
        <ThumbsDown />
      </Button>
    </div>
  );
};

export default VoteControl;
