import { executeMutation } from "@sun/ssr";
import type {
  ConfirmAccountReactivationResponse,
  DeactivateAccountResponse,
  RequestAccountReactivationResponse,
} from "~/generated/graphql";

/**
 * Deactivates the calling account, revoking its sessions.
 */
export async function deactivateAccount(): Promise<DeactivateAccountResponse> {
  return executeMutation<DeactivateAccountResponse>(
    "gaia/deactivateAccount",
    {},
  );
}

/**
 * Emails a reactivation link to the given address for a deactivated account.
 */
export async function requestAccountReactivation(
  email: string,
): Promise<RequestAccountReactivationResponse> {
  return executeMutation<RequestAccountReactivationResponse>(
    "gaia/requestAccountReactivation",
    { email, provider: "discord" },
  );
}

/**
 * Reactivates an account using a confirmation token.
 */
export async function confirmAccountReactivation(
  token: string,
): Promise<ConfirmAccountReactivationResponse> {
  return executeMutation<ConfirmAccountReactivationResponse>(
    "gaia/confirmAccountReactivation",
    { token },
  );
}
