import { useTransition, useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button, cn } from "@sun/components";
import {
  vote as castVote,
  removeVote as removeMyVote,
} from "~/server/actions/annotation";
import {
  ReaderVoteTarget,
  VoteValue,
  type ListAnnotationsQuery,
} from "~/generated/graphql";
import styles from "./vote-control.module.css";

type Annotation = ListAnnotationsQuery["hadesQueries"]["annotations"][number];

/**
 * Net-score delta for every (previous vote → next vote) transition.
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
   * The annotation being voted on.
   */
  annotation: Annotation;
  /**
   * Called with the new net score after a successful vote change, so the parent
   * can re-sort and re-render.
   */
  onVoted?: (netScore: number) => void;
};

/**
 * Up/down vote control for an annotation.
 */
const VoteControl = ({ annotation, onVoted }: VoteControlProps) => {
  const { t } = useTranslation("texts");
  const [vote, setVote] = useState<VoteValue | null>(annotation.myVote ?? null);
  const [score, setScore] = useState(annotation.netScore);
  const [pending, startTransition] = useTransition();

  /**
   * Applies a vote change: casts or removes the caller's vote and updates the
   * optimistic score, notifying the parent of the new score.
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
      const result =
        next === null
          ? await removeMyVote(ReaderVoteTarget.Annotation, annotation.id)
          : await castVote(ReaderVoteTarget.Annotation, annotation.id, next);
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
    <div className={styles.vote_control}>
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
