import { ThumbsDown, ThumbsUp } from "lucide-preact";
import { useTranslation } from "@sun/i18n";
import { Button, cn } from "@sun/components";
import { VoteValue } from "~/generated/graphql";
import styles from "./vote-control.module.css";

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
   * Called with the next vote value; null removes the vote.
   */
  onVoteChange: (next: VoteValue | null) => void;
  /**
   * Whether a vote mutation is in flight.
   */
  pending?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Up/down vote control; the parent owns the optimistic score.
 */
const VoteControl = ({
  myVote,
  netScore,
  onVoteChange,
  pending = false,
  className,
}: VoteControlProps) => {
  const { t } = useTranslation("texts");
  const vote = myVote ?? null;

  const handleUp = () => onVoteChange(vote === VoteValue.Up ? null : VoteValue.Up);
  const handleDown = () => onVoteChange(vote === VoteValue.Down ? null : VoteValue.Down);

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
      <span className={styles.score}>{netScore}</span>
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
