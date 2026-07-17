import { useTransition, useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button, cn } from "@sun/components";
import type { MutationResult } from "@sun/ssr";
import { VoteValue } from "~/generated/graphql";
import styles from "./vote-control.module.css";

/**
 * Score change applied for each vote transition.
 */
const NONE = "none";
const SCORE_DELTA: Record<string, number> = {
  "UP-UP": 0,
  "UP-DOWN": -2,
  "UP-none": -1,
  "DOWN-UP": 2,
  "DOWN-DOWN": 0,
  "DOWN-none": 1,
  "none-UP": 1,
  "none-DOWN": -1,
  "none-none": 0,
};

type VoteControlProps = {
  /**
   * The caller's current vote, if any.
   */
  myVote?: VoteValue | null;
  /**
   * Current net score.
   */
  netScore: number;
  /**
   * Casts or removes a vote. The resolved result is checked so the control can
   * roll back on failure.
   */
  onVoteChange: (next: VoteValue | null) => Promise<MutationResult>;
  /**
   * Called with the new score after a successful change, for parent re-sort.
   */
  onVoted?: (netScore: number) => void;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Up/down vote control with an optimistic score and rollback.
 */
const VoteControl = ({
  myVote,
  netScore,
  onVoteChange,
  onVoted,
  className,
}: VoteControlProps) => {
  const { t } = useTranslation("texts");
  const [vote, setVote] = useState<VoteValue | null>(myVote ?? null);
  const [score, setScore] = useState(netScore);
  const [pending, startTransition] = useTransition();

  /**
   * Applies a vote change: updates the optimistic score, notifies the parent,
   * and rolls back if the mutation fails.
   */
  const applyVote = (next: VoteValue | null) => {
    const delta = SCORE_DELTA[`${vote ?? NONE}-${next ?? NONE}`] ?? 0;
    const nextScore = score + delta;
    const prevVote = vote;
    const prevScore = score;
    setVote(next);
    setScore(nextScore);
    onVoted?.(nextScore);
    startTransition(async () => {
      const result = await onVoteChange(next);
      if (result.__typename !== "QuerySuccess") {
        setVote(prevVote);
        setScore(prevScore);
        onVoted?.(prevScore);
      }
    });
  };

  const handleUp = () => applyVote(vote === VoteValue.Up ? null : VoteValue.Up);
  const handleDown = () =>
    applyVote(vote === VoteValue.Down ? null : VoteValue.Down);

  return (
    <div className={cn(styles.vote_control, className)}>
      <Button
        type="button"
        variant="secondary"
        className={cn(vote === VoteValue.Up && styles.vote_button_active)}
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
        className={cn(vote === VoteValue.Down && styles.vote_button_active)}
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
