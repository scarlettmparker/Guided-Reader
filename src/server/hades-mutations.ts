import { defineMutation, MutationError } from "@sun/ssr";
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
  CreatePrivateNoteDocument,
  type CreatePrivateNoteMutation,
  type CreatePrivateNoteMutationVariables,
  DeletePrivateNoteDocument,
  type DeletePrivateNoteMutation,
  type DeletePrivateNoteMutationVariables,
  ShareNotesDocument,
  type ShareNotesMutation,
  type ShareNotesMutationVariables,
  MarkViewedDocument,
  type MarkViewedMutation,
  type MarkViewedMutationVariables,
} from "~/generated/graphql";

type CreateAnnotationResponse = CreateAnnotationMutation["hadesMutations"]["createAnnotation"];
type EditAnnotationResponse = EditAnnotationMutation["hadesMutations"]["editAnnotation"];
type DeleteAnnotationResponse = DeleteAnnotationMutation["hadesMutations"]["deleteAnnotation"];
type AddCommentResponse = AddCommentMutation["hadesMutations"]["addComment"];
type DeleteCommentResponse = DeleteCommentMutation["hadesMutations"]["deleteComment"];
type VoteReaderResponse = HadesVoteMutation["hadesMutations"]["vote"];
type CreatePrivateNoteResponse = CreatePrivateNoteMutation["hadesMutations"]["createPrivateNote"];
type DeletePrivateNoteResponse = DeletePrivateNoteMutation["hadesMutations"]["deletePrivateNote"];
type ShareNotesResponse = ShareNotesMutation["hadesMutations"]["shareNotes"];
type MarkViewedResponse = MarkViewedMutation["hadesMutations"]["markViewed"];

/**
 * Creates an annotation on a text range.
 */
defineMutation<CreateAnnotationMutationVariables, CreateAnnotationResponse>({
  path: "hades/createAnnotation",
  async handler(body, context) {
    const result = await executeDocument<
      CreateAnnotationMutation,
      CreateAnnotationMutationVariables
    >(CreateAnnotationDocument, body, tokenFrom(context));
    if (result.statusCode === 429 || result.error?.includes("429")) {
      throw new MutationError("rate_limited", 429);
    }
    const data = result.data?.hadesMutations.createAnnotation;
    if (data == null) {
      throw new MutationError(result.error || "Failed to create annotation.", result.statusCode);
    }
    return data;
  },
});

/**
 * Updates an annotation's body.
 */
defineMutation<EditAnnotationMutationVariables, EditAnnotationResponse>({
  path: "hades/editAnnotation",
  async handler(body, context) {
    const result = await executeDocument<EditAnnotationMutation, EditAnnotationMutationVariables>(
      EditAnnotationDocument,
      body,
      tokenFrom(context),
    );
    const data = result.data?.hadesMutations.editAnnotation;
    if (data == null) {
      throw new MutationError(result.error || "Failed to edit annotation.", result.statusCode);
    }
    return data;
  },
});

/**
 * Deletes an annotation.
 */
defineMutation<DeleteAnnotationMutationVariables, DeleteAnnotationResponse>({
  path: "hades/deleteAnnotation",
  async handler(body, context) {
    const result = await executeDocument<
      DeleteAnnotationMutation,
      DeleteAnnotationMutationVariables
    >(DeleteAnnotationDocument, body, tokenFrom(context));
    const data = result.data?.hadesMutations.deleteAnnotation;
    if (data == null) {
      throw new MutationError(result.error || "Failed to delete annotation.", result.statusCode);
    }
    return data;
  },
});

/**
 * Adds a comment (or reply) to an annotation.
 */
defineMutation<AddCommentMutationVariables, AddCommentResponse>({
  path: "hades/addComment",
  async handler(body, context) {
    const result = await executeDocument<AddCommentMutation, AddCommentMutationVariables>(
      AddCommentDocument,
      body,
      tokenFrom(context),
    );
    const data = result.data?.hadesMutations.addComment;
    if (data == null) {
      throw new MutationError(result.error || "Failed to add comment.", result.statusCode);
    }
    return data;
  },
});

/**
 * Deletes a comment on an annotation.
 */
defineMutation<DeleteCommentMutationVariables, DeleteCommentResponse>({
  path: "hades/deleteComment",
  async handler(body, context) {
    const result = await executeDocument<DeleteCommentMutation, DeleteCommentMutationVariables>(
      DeleteCommentDocument,
      body,
      tokenFrom(context),
    );
    const data = result.data?.hadesMutations.deleteComment;
    if (data == null) {
      throw new MutationError(result.error || "Failed to delete comment.", result.statusCode);
    }
    return data;
  },
});

/**
 * Casts a vote on an annotation or comment.
 */
defineMutation<HadesVoteMutationVariables, VoteReaderResponse>({
  path: "hades/vote",
  async handler(body, context) {
    const result = await executeDocument<HadesVoteMutation, HadesVoteMutationVariables>(
      HadesVoteDocument,
      body,
      tokenFrom(context),
    );
    const data = result.data?.hadesMutations.vote;
    if (data == null) {
      throw new MutationError(result.error || "Failed to vote.", result.statusCode);
    }
    return data;
  },
});

/**
 * Removes the caller's vote on an annotation or comment.
 */
defineMutation<RemoveVoteMutationVariables, VoteReaderResponse>({
  path: "hades/removeVote",
  async handler(body, context) {
    const result = await executeDocument<RemoveVoteMutation, RemoveVoteMutationVariables>(
      RemoveVoteDocument,
      body,
      tokenFrom(context),
    );
    const data = result.data?.hadesMutations.removeVote;
    if (data == null) {
      throw new MutationError(result.error || "Failed to remove vote.", result.statusCode);
    }
    return data;
  },
});

/**
 * Creates a private note on a text range.
 */
defineMutation<CreatePrivateNoteMutationVariables, CreatePrivateNoteResponse>({
  path: "hades/createPrivateNote",
  async handler(body, context) {
    const result = await executeDocument<
      CreatePrivateNoteMutation,
      CreatePrivateNoteMutationVariables
    >(CreatePrivateNoteDocument, body, tokenFrom(context));
    const data = result.data?.hadesMutations.createPrivateNote;
    if (data == null) {
      throw new MutationError(result.error || "Failed to create private note.", result.statusCode);
    }
    return data;
  },
});

/**
 * Deletes a private note.
 */
defineMutation<DeletePrivateNoteMutationVariables, DeletePrivateNoteResponse>({
  path: "hades/deletePrivateNote",
  async handler(body, context) {
    const result = await executeDocument<
      DeletePrivateNoteMutation,
      DeletePrivateNoteMutationVariables
    >(DeletePrivateNoteDocument, body, tokenFrom(context));
    const data = result.data?.hadesMutations.deletePrivateNote;
    if (data == null) {
      throw new MutationError(result.error || "Failed to delete private note.", result.statusCode);
    }
    return data;
  },
});

/**
 * Shares all private notes on a text.
 */
defineMutation<ShareNotesMutationVariables, ShareNotesResponse>({
  path: "hades/shareNotes",
  async handler(body, context) {
    const result = await executeDocument<ShareNotesMutation, ShareNotesMutationVariables>(
      ShareNotesDocument,
      body,
      tokenFrom(context),
    );
    const data = result.data?.hadesMutations.shareNotes;
    if (data == null) {
      throw new MutationError(result.error || "Failed to share notes.", result.statusCode);
    }
    return data;
  },
});

/**
 * Marks a text as viewed.
 */
defineMutation<MarkViewedMutationVariables, MarkViewedResponse>({
  path: "hades/markViewed",
  async handler(body, context) {
    const result = await executeDocument<MarkViewedMutation, MarkViewedMutationVariables>(
      MarkViewedDocument,
      body,
      tokenFrom(context),
    );
    const data = result.data?.hadesMutations.markViewed;
    if (data == null) {
      throw new MutationError(result.error || "Failed to mark viewed.", result.statusCode);
    }
    return data;
  },
});
