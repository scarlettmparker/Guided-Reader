import { defineMutation, makeCacheKey } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import { tokenFrom } from "./context";
import {
  CreatePostDocument,
  type CreatePostMutation,
  type CreatePostMutationVariables,
  CreateThreadDocument,
  type CreateThreadMutation,
  type CreateThreadMutationVariables,
  IcarusRemoveVoteDocument,
  type IcarusRemoveVoteMutation,
  type IcarusRemoveVoteMutationVariables,
  IcarusVoteDocument,
  type IcarusVoteMutation,
  type IcarusVoteMutationVariables,
} from "~/generated/graphql";

/**
 * Creates a discussion thread on a text; invalidates that text's threads.
 */
defineMutation({
  path: "icarus/createThread",
  async handler(
    body: CreateThreadMutationVariables & { textId?: string },
    context,
  ) {
    const result = await executeDocument<
      CreateThreadMutation,
      CreateThreadMutationVariables
    >(CreateThreadDocument, { input: body.input }, tokenFrom(context));
    const data = result.data?.icarusMutations.createThread;
    return {
      ...(data ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to create thread.",
      }),
      invalidated: body.textId
        ? [makeCacheKey("texts/:id/discussion:threads", { id: body.textId })]
        : [],
    };
  },
});

/**
 * Creates a post (or reply) in a thread; invalidates that thread's posts.
 */
defineMutation({
  path: "icarus/createPost",
  async handler(
    body: CreatePostMutationVariables & { textId?: string },
    context,
  ) {
    const result = await executeDocument<
      CreatePostMutation,
      CreatePostMutationVariables
    >(CreatePostDocument, { input: body.input }, tokenFrom(context));
    const data = result.data?.icarusMutations.createPost;
    return {
      ...(data ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to create post.",
      }),
      invalidated: [
        makeCacheKey("threads/:threadId:posts", {
          threadId: body.input.threadId,
        }),
        ...(body.textId
          ? [makeCacheKey("texts/:id/discussion:threads", { id: body.textId })]
          : []),
      ],
    };
  },
});

/**
 * Casts a vote on a forum post.
 */
defineMutation({
  path: "icarus/vote",
  async handler(body: IcarusVoteMutationVariables, context) {
    const result = await executeDocument<
      IcarusVoteMutation,
      IcarusVoteMutationVariables
    >(IcarusVoteDocument, body, tokenFrom(context));
    return (
      result.data?.icarusMutations.vote ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to vote.",
      }
    );
  },
});

/**
 * Removes the caller's vote on a forum post.
 */
defineMutation({
  path: "icarus/removeVote",
  async handler(body: IcarusRemoveVoteMutationVariables, context) {
    const result = await executeDocument<
      IcarusRemoveVoteMutation,
      IcarusRemoveVoteMutationVariables
    >(IcarusRemoveVoteDocument, body, tokenFrom(context));
    return (
      result.data?.icarusMutations.removeVote ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to remove vote.",
      }
    );
  },
});
