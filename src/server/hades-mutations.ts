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
  AddCommentDocument,
  type AddCommentMutation,
  type AddCommentMutationVariables,
  DeleteCommentDocument,
  type DeleteCommentMutation,
  type DeleteCommentMutationVariables,
  HadesVoteDocument,
  type HadesVoteMutation,
  type HadesVoteMutationVariables,
  RemoveVoteDocument,
  type RemoveVoteMutation,
  type RemoveVoteMutationVariables,
} from "~/generated/graphql";

/**
 * Creates an annotation on a text range; invalidates that text's annotations.
 */
defineMutation({
  path: "hades/createAnnotation",
  async handler(body: CreateAnnotationMutationVariables, context) {
    const result = await executeDocument<
      CreateAnnotationMutation,
      CreateAnnotationMutationVariables
    >(CreateAnnotationDocument, body, tokenFrom(context));
    const data = result.data?.hadesMutations.createAnnotation;
    return {
      ...(data ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to create annotation.",
      }),
      invalidated: [
        makeCacheKey("texts/:id:annotations", { id: body.input.textId }),
      ],
    };
  },
});

/**
 * Updates an annotation's body.
 */
defineMutation({
  path: "hades/editAnnotation",
  async handler(body: EditAnnotationMutationVariables, context) {
    const result = await executeDocument<
      EditAnnotationMutation,
      EditAnnotationMutationVariables
    >(EditAnnotationDocument, body, tokenFrom(context));
    const data = result.data?.hadesMutations.editAnnotation;
    return (
      data ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to edit annotation.",
      }
    );
  },
});

/**
 * Deletes an annotation; invalidates the parent text's annotations.
 */
defineMutation({
  path: "hades/deleteAnnotation",
  async handler(
    body: DeleteAnnotationMutationVariables & { textId?: string },
    context,
  ) {
    const result = await executeDocument<
      DeleteAnnotationMutation,
      DeleteAnnotationMutationVariables
    >(DeleteAnnotationDocument, { id: body.id }, tokenFrom(context));
    const data = result.data?.hadesMutations.deleteAnnotation;
    return {
      ...(data ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to delete annotation.",
      }),
      invalidated: body.textId
        ? [makeCacheKey("texts/:id:annotations", { id: body.textId })]
        : [],
    };
  },
});

/**
 * Adds a comment (or reply) to an annotation; invalidates that annotation's
 * comments.
 */
defineMutation({
  path: "hades/addComment",
  async handler(body: AddCommentMutationVariables, context) {
    const result = await executeDocument<
      AddCommentMutation,
      AddCommentMutationVariables
    >(AddCommentDocument, body, tokenFrom(context));
    const data = result.data?.hadesMutations.addComment;
    return {
      ...(data ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to add comment.",
      }),
      invalidated: [
        makeCacheKey("annotations/:annotationId:comments", {
          annotationId: body.input.annotationId,
        }),
      ],
    };
  },
});

/**
 * Deletes a comment on an annotation; invalidates that annotation's comments.
 */
defineMutation({
  path: "hades/deleteComment",
  async handler(
    body: DeleteCommentMutationVariables & { annotationId?: string },
    context,
  ) {
    const result = await executeDocument<
      DeleteCommentMutation,
      DeleteCommentMutationVariables
    >(DeleteCommentDocument, { id: body.id }, tokenFrom(context));
    const data = result.data?.hadesMutations.deleteComment;
    return {
      ...(data ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to delete comment.",
      }),
      invalidated: body.annotationId
        ? [
            makeCacheKey("annotations/:annotationId:comments", {
              annotationId: body.annotationId,
            }),
          ]
        : [],
    };
  },
});

/**
 * Casts a vote on an annotation or comment.
 */
defineMutation({
  path: "hades/vote",
  async handler(body: HadesVoteMutationVariables, context) {
    const result = await executeDocument<
      HadesVoteMutation,
      HadesVoteMutationVariables
    >(HadesVoteDocument, body, tokenFrom(context));
    return (
      result.data?.hadesMutations.vote ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to vote.",
      }
    );
  },
});

/**
 * Removes the caller's vote on an annotation or comment.
 */
defineMutation({
  path: "hades/removeVote",
  async handler(body: RemoveVoteMutationVariables, context) {
    const result = await executeDocument<
      RemoveVoteMutation,
      RemoveVoteMutationVariables
    >(RemoveVoteDocument, body, tokenFrom(context));
    return (
      result.data?.hadesMutations.removeVote ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to remove vote.",
      }
    );
  },
});
