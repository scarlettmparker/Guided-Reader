import { executeMutation, type MutationResult } from "@sun/ssr";
import type {
  AnnotationInput,
  CommentInput,
  ReaderVoteTarget,
  VoteValue,
} from "~/generated/graphql";

/**
 * Creates an annotation on a text range.
 */
export async function createAnnotation(
  input: AnnotationInput,
): Promise<MutationResult> {
  return executeMutation("hades/createAnnotation", { input });
}

/**
 * Adds a comment (or reply) to an annotation.
 */
export async function addComment(
  input: CommentInput,
): Promise<MutationResult> {
  return executeMutation("hades/addComment", { input });
}

/**
 * Deletes an annotation (owner only).
 */
export async function deleteAnnotation(
  id: string,
  textId: string,
): Promise<MutationResult> {
  return executeMutation("hades/deleteAnnotation", { id, textId });
}

/**
 * Casts a vote on an annotation or comment.
 */
export async function vote(
  targetType: ReaderVoteTarget,
  targetId: string,
  value: VoteValue,
): Promise<MutationResult> {
  return executeMutation("hades/vote", {
    input: { targetType, targetId, value },
  });
}

/**
 * Removes the caller's vote on an annotation or comment.
 */
export async function removeVote(
  targetType: ReaderVoteTarget,
  targetId: string,
): Promise<MutationResult> {
  return executeMutation("hades/removeVote", { targetType, targetId });
}
