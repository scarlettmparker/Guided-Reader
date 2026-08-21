import { defineMutation, makeCacheKey } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import { tokenFrom } from "./context";
import {
  SuspendAccountDocument,
  UnsuspendAccountDocument,
  DeactivateAccountDocument,
  RequestAccountReactivationDocument,
  ConfirmAccountReactivationDocument,
  CreateRoleDocument,
  DeleteRoleDocument,
  SetAccountRolesDocument,
  SetAccountPermissionsDocument,
  SetRolePermissionsDocument,
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
  type CreateRoleMutation,
  type CreateRoleMutationVariables,
  type DeleteRoleMutation,
  type DeleteRoleMutationVariables,
  type SetAccountRolesMutation,
  type SetAccountRolesMutationVariables,
  type SetAccountPermissionsMutation,
  type SetAccountPermissionsMutationVariables,
  type SetRolePermissionsMutation,
  type SetRolePermissionsMutationVariables,
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

/**
 * Creates a new role.
 */
// @ts-expect-error createRole returns Role not QueryResult
defineMutation({
  path: "gaia/createRole",
  async handler(body: CreateRoleMutationVariables, context) {
    const result = await executeDocument<CreateRoleMutation, CreateRoleMutationVariables>(
      CreateRoleDocument,
      body,
      tokenFrom(context),
    );
    const data = result.data?.gaiaMutations?.createRole;
    if (!data) {
      return {
        __typename: "StandardError" as const,
        message: result.error || "Failed to create role.",
      };
    }
    return {
      ...data,
      invalidated: [makeCacheKey("admin/roles:roles", {})],
    };
  },
});

/**
 * Deletes a role.
 */
defineMutation({
  path: "gaia/deleteRole",
  async handler(body: DeleteRoleMutationVariables, context) {
    const result = await executeDocument<DeleteRoleMutation, DeleteRoleMutationVariables>(
      DeleteRoleDocument,
      body,
      tokenFrom(context),
    );
    const data = result.data?.gaiaMutations?.deleteRole;
    return {
      ...(data ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to delete role.",
      }),
      invalidated: [makeCacheKey("admin/roles:roles", {})],
    };
  },
});

/**
 * Replaces the account's roles.
 */
defineMutation({
  path: "gaia/setAccountRoles",
  async handler(body: SetAccountRolesMutationVariables, context) {
    const result = await executeDocument<
      SetAccountRolesMutation,
      SetAccountRolesMutationVariables
    >(SetAccountRolesDocument, body, tokenFrom(context));
    const data = result.data?.gaiaMutations?.setAccountRoles;
    return {
      ...(data ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to set account roles.",
      }),
      invalidated: [makeCacheKey("admin/:id/roles:accountRoles", { id: body.accountId })],
    };
  },
});

/**
 * Replaces the account's direct permissions.
 */
defineMutation({
  path: "gaia/setAccountPermissions",
  async handler(body: SetAccountPermissionsMutationVariables, context) {
    const result = await executeDocument<
      SetAccountPermissionsMutation,
      SetAccountPermissionsMutationVariables
    >(SetAccountPermissionsDocument, body, tokenFrom(context));
    const data = result.data?.gaiaMutations?.setAccountPermissions;
    return {
      ...(data ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to set account permissions.",
      }),
      invalidated: [
        makeCacheKey("admin/:id/permissions:accountPermissions", { id: body.accountId }),
      ],
    };
  },
});

/**
 * Replaces a role's permissions.
 */
defineMutation({
  path: "gaia/setRolePermissions",
  async handler(body: SetRolePermissionsMutationVariables, context) {
    const result = await executeDocument<
      SetRolePermissionsMutation,
      SetRolePermissionsMutationVariables
    >(SetRolePermissionsDocument, body, tokenFrom(context));
    const data = result.data?.gaiaMutations?.setRolePermissions;
    return {
      ...(data ?? {
        __typename: "StandardError" as const,
        message: result.error || "Failed to set role permissions.",
      }),
      invalidated: [
        makeCacheKey("admin/roles/:id/permissions:rolePermissions", { id: body.roleId }),
      ],
    };
  },
});
