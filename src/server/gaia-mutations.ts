import { defineMutation, makeCacheKey } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import { tokenFrom } from "./context";
import {
  SuspendAccountDocument,
  UnsuspendAccountDocument,
  DeactivateAccountDocument,
  RequestAccountReactivationDocument,
  ConfirmAccountReactivationDocument,
  type SuspendAccountMutation,
  type SuspendAccountMutationVariables,
  type UnsuspendAccountMutation,
  type UnsuspendAccountMutationVariables,
  type DeactivateAccountMutation,
  type DeactivateAccountMutationVariables,
  type RequestAccountReactivationMutation,
  type RequestAccountReactivationMutationVariables,
  type ConfirmAccountReactivationMutation,
  type ConfirmAccountReactivationMutationVariables,
} from "~/generated/graphql";

/**
 * Suspends an account, revoking all active sessions.
 */
defineMutation({
  path: "gaia/suspendAccount",
  async handler(body: SuspendAccountMutationVariables, context) {
    const result = await executeDocument<
      SuspendAccountMutation,
      SuspendAccountMutationVariables
    >(SuspendAccountDocument, { id: body.id }, tokenFrom(context));
    const data = result.data?.gaiaMutations?.suspendAccount;
    return {
      ...(data ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to suspend account.",
      }),
      invalidated: [
        makeCacheKey("accounts:accounts", { page: "*" }),
        makeCacheKey("admin/:id:account", { id: body.id }),
      ],
    };
  },
});

/**
 * Re-activates a suspended account.
 */
defineMutation({
  path: "gaia/unsuspendAccount",
  async handler(body: UnsuspendAccountMutationVariables, context) {
    const result = await executeDocument<
      UnsuspendAccountMutation,
      UnsuspendAccountMutationVariables
    >(UnsuspendAccountDocument, { id: body.id }, tokenFrom(context));
    const data = result.data?.gaiaMutations?.unsuspendAccount;
    return {
      ...(data ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to unsuspend account.",
      }),
      invalidated: [
        makeCacheKey("accounts:accounts", { page: "*" }),
        makeCacheKey("admin/:id:account", { id: body.id }),
      ],
    };
  },
});

/**
 * Deactivates the calling account, revoking its sessions.
 */
defineMutation({
  path: "gaia/deactivateAccount",
  async handler(body: DeactivateAccountMutationVariables, context) {
    const result = await executeDocument<
      DeactivateAccountMutation,
      DeactivateAccountMutationVariables
    >(DeactivateAccountDocument, body, tokenFrom(context));
    const data = result.data?.gaiaMutations?.deactivateAccount;
    return {
      ...(data ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to deactivate account.",
      }),
      invalidated: [makeCacheKey("currentUser:currentUser", {})],
    };
  },
});

/**
 * Emails a reactivation link to the given address.
 */
defineMutation({
  path: "gaia/requestAccountReactivation",
  async handler(body: RequestAccountReactivationMutationVariables, _context) {
    const result = await executeDocument<
      RequestAccountReactivationMutation,
      RequestAccountReactivationMutationVariables
    >(RequestAccountReactivationDocument, body);
    return (
      result.data?.gaiaMutations?.requestAccountReactivation ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to request reactivation.",
      }
    );
  },
});

/**
 * Reactivates an account using a confirmation token.
 */
defineMutation({
  path: "gaia/confirmAccountReactivation",
  async handler(body: ConfirmAccountReactivationMutationVariables, _context) {
    const result = await executeDocument<
      ConfirmAccountReactivationMutation,
      ConfirmAccountReactivationMutationVariables
    >(ConfirmAccountReactivationDocument, body);
    return (
      result.data?.gaiaMutations?.confirmAccountReactivation ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to confirm reactivation.",
      }
    );
  },
});
