import { executeMutation } from "@sun/ssr";
import type {
  CreatePrivateNoteResponse,
  DeletePrivateNoteResponse,
  PrivateNoteInput,
  ShareNotesResponse,
} from "~/generated/graphql";

/**
 * Creates a private note on a text range.
 */
export async function createPrivateNote(
  input: PrivateNoteInput,
): Promise<CreatePrivateNoteResponse> {
  return executeMutation<CreatePrivateNoteResponse>("hades/createPrivateNote", { input });
}

/**
 * Deletes a private note (owner only).
 */
export async function deletePrivateNote(id: string): Promise<DeletePrivateNoteResponse> {
  return executeMutation<DeletePrivateNoteResponse>("hades/deletePrivateNote", { id });
}

/**
 * Shares all private notes on a text.
 */
export async function shareNotes(input: {
  textId: string;
  subjectIds?: string[];
  subjectEmails?: string[];
}): Promise<ShareNotesResponse> {
  return executeMutation<ShareNotesResponse>("hades/shareNotes", { input });
}
