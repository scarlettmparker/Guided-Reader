import { executeMutation } from "@sun/ssr";
import type {
  AddCommentResponse,
  AnnotationInput,
  CommentInput,
  CreateAnnotationResponse,
  DeleteAnnotationResponse,
  DeleteCommentResponse,
  ReaderVoteTarget,
  VoteReaderResponse,
  VoteValue,
} from "~/generated/graphql";

/**
 * Creates an annotation on a text range.
 */
export async function createAnnotation(input: AnnotationInput): Promise<CreateAnnotationResponse> {
  return executeMutation<CreateAnnotationResponse>("hades/createAnnotation", {
    input,
  });
}

/**
 * Adds a comment (or reply) to an annotation.
 */
export async function addComment(input: CommentInput): Promise<AddCommentResponse> {
  return executeMutation<AddCommentResponse>("hades/addComment", { input });
}

/**
 * Deletes an annotation (owner only).
 */
export async function deleteAnnotation(id: string): Promise<DeleteAnnotationResponse> {
  return executeMutation<DeleteAnnotationResponse>("hades/deleteAnnotation", {
    id,
  });
}

/**
 * Deletes a comment on an annotation (owner only).
 */
export async function deleteComment(id: string): Promise<DeleteCommentResponse> {
  return executeMutation<DeleteCommentResponse>("hades/deleteComment", { id });
}

/**
 * Casts a vote on an annotation or comment.
 */
export async function vote(
  targetType: ReaderVoteTarget,
  targetId: string,
  value: VoteValue,
): Promise<VoteReaderResponse> {
  return executeMutation<VoteReaderResponse>("hades/vote", {
    input: { targetType, targetId, value },
  });
}

/**
 * Removes the caller's vote on an annotation or comment.
 */
export async function removeVote(
  targetType: ReaderVoteTarget,
  targetId: string,
): Promise<VoteReaderResponse> {
  return executeMutation<VoteReaderResponse>("hades/removeVote", {
    targetType,
    targetId,
  });
}
