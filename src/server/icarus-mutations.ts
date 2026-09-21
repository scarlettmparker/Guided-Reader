import { defineMutation, MutationError } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import { tokenFrom } from "./context";
import {
  CreatePostDocument,
  type CreatePostMutation,
  type CreatePostMutationVariables,
  CreateThreadDocument,
  type CreateThreadMutation,
  type CreateThreadMutationVariables,
  DeletePostDocument,
  type DeletePostMutation,
  type DeletePostMutationVariables,
  IcarusRemoveVoteDocument,
  type IcarusRemoveVoteMutation,
  type IcarusRemoveVoteMutationVariables,
  IcarusVoteDocument,
  type IcarusVoteMutation,
  type IcarusVoteMutationVariables,
} from "~/generated/graphql";

type CreateThreadResponse =
  CreateThreadMutation["icarusMutations"]["createThread"];
type CreatePostResponse = CreatePostMutation["icarusMutations"]["createPost"];
type DeletePostResponse = DeletePostMutation["icarusMutations"]["deletePost"];
type VoteForumResponse = IcarusVoteMutation["icarusMutations"]["vote"];
type RemoveVoteResponse =
  IcarusRemoveVoteMutation["icarusMutations"]["removeVote"];

/**
 * Creates a discussion thread on a text.
 */
defineMutation<CreateThreadMutationVariables, CreateThreadResponse>({
  path: "icarus/createThread",
  async handler(body, context) {
    const result = await executeDocument<
      CreateThreadMutation,
      CreateThreadMutationVariables
    >(CreateThreadDocument, body, tokenFrom(context));
    const data = result.data?.icarusMutations.createThread;
    if (data == null) {
      throw new MutationError(
        result.error || "Failed to create thread.",
        result.statusCode,
      );
    }
    return data;
  },
});

/**
 * Creates a post (or reply) in a thread.
 */
defineMutation<CreatePostMutationVariables, CreatePostResponse>({
  path: "icarus/createPost",
  async handler(body, context) {
    const result = await executeDocument<
      CreatePostMutation,
      CreatePostMutationVariables
    >(CreatePostDocument, body, tokenFrom(context));
    const data = result.data?.icarusMutations.createPost;
    if (data == null) {
      throw new MutationError(
        result.error || "Failed to create post.",
        result.statusCode,
      );
    }
    return data;
  },
});

/**
 * Deletes a post from a thread.
 */
defineMutation<DeletePostMutationVariables, DeletePostResponse>({
  path: "icarus/deletePost",
  async handler(body, context) {
    const result = await executeDocument<
      DeletePostMutation,
      DeletePostMutationVariables
    >(DeletePostDocument, body, tokenFrom(context));
    const data = result.data?.icarusMutations.deletePost;
    if (data == null) {
      throw new MutationError(
        result.error || "Failed to delete post.",
        result.statusCode,
      );
    }
    return data;
  },
});

/**
 * Casts a vote on a forum post.
 */
defineMutation<IcarusVoteMutationVariables, VoteForumResponse>({
  path: "icarus/vote",
  async handler(body, context) {
    const result = await executeDocument<
      IcarusVoteMutation,
      IcarusVoteMutationVariables
    >(IcarusVoteDocument, body, tokenFrom(context));
    const data = result.data?.icarusMutations.vote;
    if (data == null) {
      throw new MutationError(
        result.error || "Failed to vote.",
        result.statusCode,
      );
    }
    return data;
  },
});

/**
 * Removes the caller's vote on a forum post.
 */
defineMutation<IcarusRemoveVoteMutationVariables, RemoveVoteResponse>({
  path: "icarus/removeVote",
  async handler(body, context) {
    const result = await executeDocument<
      IcarusRemoveVoteMutation,
      IcarusRemoveVoteMutationVariables
    >(IcarusRemoveVoteDocument, body, tokenFrom(context));
    const data = result.data?.icarusMutations.removeVote;
    if (data == null) {
      throw new MutationError(
        result.error || "Failed to remove vote.",
        result.statusCode,
      );
    }
    return data;
  },
});
