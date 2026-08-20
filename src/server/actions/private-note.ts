import { executeMutation, type MutationResult } from "@sun/ssr";
import type { PrivateNoteInput } from "~/generated/graphql";

/**
 * Creates a private note on a text range.
 */
export async function createPrivateNote(input: PrivateNoteInput): Promise<MutationResult> {
  return executeMutation("hades/createPrivateNote", { input });
}

/**
 * Deletes a private note (owner only).
 */
export async function deletePrivateNote(id: string, textId: string): Promise<MutationResult> {
  return executeMutation("hades/deletePrivateNote", { id, textId });
}

/**
 * Shares all private notes on a text.
 */
export async function shareNotes(input: { textId: string; subjectIds?: string[]; subjectEmails?: string[] }): Promise<MutationResult> {
  return executeMutation("hades/shareNotes", { input });
}
