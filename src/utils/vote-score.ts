import { VoteValue } from "~/generated/graphql";

/**
 * Net-score change when a target's vote moves from one value to another.
 */
export function voteScoreDelta(
  from: VoteValue | null | undefined,
  to: VoteValue | null | undefined,
): number {
  const current = from ?? null;
  const next = to ?? null;
  if (current === next) return 0;
  if (current === null) return next === VoteValue.Up ? 1 : -1;
  if (next === null) return current === VoteValue.Up ? -1 : 1;
  return next === VoteValue.Up ? 2 : -2;
}
