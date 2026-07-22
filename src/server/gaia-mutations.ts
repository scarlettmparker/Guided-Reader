import { defineMutation, makeCacheKey } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import { tokenFrom } from "./context";
import {
  SuspendAccountDocument,
  UnsuspendAccountDocument,
  type SuspendAccountMutation,
  type SuspendAccountMutationVariables,
  type UnsuspendAccountMutation,
  type UnsuspendAccountMutationVariables,
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
