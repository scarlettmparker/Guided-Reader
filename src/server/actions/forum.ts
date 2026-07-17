import { executeMutation, type MutationResult } from "@sun/ssr";
import type { CreatePostInput, CreateThreadInput, VoteValue } from "~/generated/graphql";

/**
 * Creates a text-level discussion thread.
 */
export async function createThread(
  input: CreateThreadInput,
  textId: string,
): Promise<MutationResult> {
  return executeMutation("icarus/createThread", { input, textId });
}

/**
 * Creates a post (or reply) in a discussion thread.
 */
export async function createPost(
  input: CreatePostInput,
  textId?: string,
): Promise<MutationResult> {
  return executeMutation("icarus/createPost", { input, textId });
}

/**
 * Casts a vote on a forum post.
 */
export async function votePost(
  postId: string,
  value: VoteValue,
): Promise<MutationResult> {
  return executeMutation("icarus/vote", { input: { postId, value } });
}

/**
 * Removes the caller's vote on a forum post.
 */
export async function removePostVote(
  postId: string,
): Promise<MutationResult> {
  return executeMutation("icarus/removeVote", { postId });
}
