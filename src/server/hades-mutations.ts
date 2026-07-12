import { defineMutation, makeCacheKey } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import { tokenFrom } from "./context";
import {
  CreateAnnotationDocument,
  type CreateAnnotationMutation,
  type CreateAnnotationMutationVariables,
  EditAnnotationDocument,
  type EditAnnotationMutation,
  type EditAnnotationMutationVariables,
  DeleteAnnotationDocument,
  type DeleteAnnotationMutation,
  type DeleteAnnotationMutationVariables,
  HadesVoteDocument,
  type HadesVoteMutation,
  type HadesVoteMutationVariables,
  RemoveVoteDocument,
  type RemoveVoteMutation,
  type RemoveVoteMutationVariables,
} from "~/generated/graphql";

defineMutation({
  path: "hades/createAnnotation",
  document: CreateAnnotationDocument,
  async handler(variables, context) {
    const result = await executeDocument<
      CreateAnnotationMutation,
      CreateAnnotationMutationVariables
    >(CreateAnnotationDocument, variables, tokenFrom(context));
    const data = result.data?.hadesMutations.createAnnotation;
    return {
      ...(data ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to create annotation.",
      }),
      invalidated: [
        makeCacheKey("texts/:id:annotations", { id: variables.input.textId }),
      ],
    };
  },
});

defineMutation({
  path: "hades/editAnnotation",
  document: EditAnnotationDocument,
  async handler(variables, context) {
    const result = await executeDocument<
      EditAnnotationMutation,
      EditAnnotationMutationVariables
    >(EditAnnotationDocument, variables, tokenFrom(context));
    const data = result.data?.hadesMutations.editAnnotation;
    return (
      data ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to edit annotation.",
      }
    );
  },
});

defineMutation({
  path: "hades/deleteAnnotation",
  document: DeleteAnnotationDocument,
  async handler(variables, context) {
    const result = await executeDocument<
      DeleteAnnotationMutation,
      DeleteAnnotationMutationVariables
    >(DeleteAnnotationDocument, variables, tokenFrom(context));
    const data = result.data?.hadesMutations.deleteAnnotation;
    return {
      ...(data ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to delete annotation.",
      }),
    };
  },
});

defineMutation({
  path: "hades/vote",
  document: HadesVoteDocument,
  async handler(variables, context) {
    const result = await executeDocument<
      HadesVoteMutation,
      HadesVoteMutationVariables
    >(HadesVoteDocument, variables, tokenFrom(context));
    return (
      result.data?.hadesMutations.vote ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to vote.",
      }
    );
  },
});

defineMutation({
  path: "hades/removeVote",
  document: RemoveVoteDocument,
  async handler(variables, context) {
    const result = await executeDocument<
      RemoveVoteMutation,
      RemoveVoteMutationVariables
    >(RemoveVoteDocument, variables, tokenFrom(context));
    return (
      result.data?.hadesMutations.removeVote ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to remove vote.",
      }
    );
  },
});
