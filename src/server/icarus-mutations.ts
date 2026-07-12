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

defineMutation({
  path: "icarus/createThread",
  document: CreateThreadDocument,
  async handler(variables) {
    const result = await executeDocument<
      CreateThreadMutation,
      CreateThreadMutationVariables
    >(CreateThreadDocument, variables);
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

defineMutation({
  path: "icarus/vote",
  document: IcarusVoteDocument,
  async handler(variables) {
    const result = await executeDocument<
      IcarusVoteMutation,
      IcarusVoteMutationVariables
    >(IcarusVoteDocument, variables);
    return (
      result.data?.icarusMutations.vote ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to vote.",
      }
    );
  },
});
