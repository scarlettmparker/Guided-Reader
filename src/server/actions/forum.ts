import { executeMutation } from "@sun/ssr";
import type {
  CreatePostInput,
  CreatePostResponse,
  CreateThreadInput,
  CreateThreadResponse,
  DeletePostResponse,
  RemoveVoteResponse,
  VoteForumResponse,
  VoteValue,
} from "~/generated/graphql";

/**
 * Creates a text-level discussion thread.
 */
export async function createThread(
  input: CreateThreadInput,
): Promise<CreateThreadResponse> {
  return executeMutation<CreateThreadResponse>("icarus/createThread", {
    input,
  });
}

/**
 * Creates a post (or reply) in a discussion thread.
 */
export async function createPost(
  input: CreatePostInput,
): Promise<CreatePostResponse> {
  return executeMutation<CreatePostResponse>("icarus/createPost", { input });
}

/**
 * Casts a vote on a forum post.
 */
export async function votePost(
  postId: string,
  value: VoteValue,
): Promise<VoteForumResponse> {
  return executeMutation<VoteForumResponse>("icarus/vote", {
    input: { postId, value },
  });
}

/**
 * Removes the caller's vote on a forum post.
 */
export async function removePostVote(
  postId: string,
): Promise<RemoveVoteResponse> {
  return executeMutation<RemoveVoteResponse>("icarus/removeVote", { postId });
}

/**
 * Deletes a post from a thread (owner only).
 */
export async function deletePost(postId: string): Promise<DeletePostResponse> {
  return executeMutation<DeletePostResponse>("icarus/deletePost", {
    id: postId,
  });
}
