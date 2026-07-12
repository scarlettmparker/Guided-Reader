import { defineMutation, ServerRedirectError } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import {
  CreateThreadDocument,
  type CreateThreadMutation,
  type CreateThreadMutationVariables,
  IcarusVoteDocument,
  type IcarusVoteMutation,
  type IcarusVoteMutationVariables,
} from "~/generated/graphql";

/**
 * Creates a thread attached to a remote object; redirects to it on success.
 */
defineMutation({
  path: "icarus/createThread",
  async handler(body: CreateThreadMutationVariables) {
    const result = await executeDocument<
      CreateThreadMutation,
      CreateThreadMutationVariables
    >(CreateThreadDocument, body);
    const data = result.data?.icarusMutations.createThread;
    if (data?.__typename === "QuerySuccess" && data.id) {
      throw new ServerRedirectError(`/thread/${data.id}`, []);
    }
    return {
      __typename: "StandardError" as const,
      message: result.error || "Failed to create thread.",
    };
  },
});

/**
 * Casts a vote on a forum post.
 */
defineMutation({
  path: "icarus/vote",
  async handler(body: IcarusVoteMutationVariables) {
    const result = await executeDocument<
      IcarusVoteMutation,
      IcarusVoteMutationVariables
    >(IcarusVoteDocument, body);
    return (
      result.data?.icarusMutations.vote ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to vote.",
      }
    );
  },
});
