import { executeMutation, type MutationResult } from "@sun/ssr";

/**
 * Deactivates the calling account, revoking its sessions.
 */
export async function deactivateAccount(): Promise<MutationResult> {
  return executeMutation("gaia/deactivateAccount", {});
}

/**
 * Emails a reactivation link to the given address for a deactivated account.
 */
export async function requestAccountReactivation(
  email: string,
): Promise<MutationResult> {
  return executeMutation("gaia/requestAccountReactivation", {
    email,
    provider: "discord",
  });
}

/**
 * Reactivates an account using a confirmation token.
 */
export async function confirmAccountReactivation(
  token: string,
): Promise<MutationResult> {
  return executeMutation("gaia/confirmAccountReactivation", { token });
}
