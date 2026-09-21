import { defineMutation, MutationError } from "@sun/ssr";
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
  type SuspendAccountResponse,
  type UnsuspendAccountMutation,
  type UnsuspendAccountMutationVariables,
  type UnsuspendAccountResponse,
  type DeactivateAccountMutation,
  type DeactivateAccountMutationVariables,
  type DeactivateAccountResponse,
  type RequestAccountReactivationMutation,
  type RequestAccountReactivationMutationVariables,
  type RequestAccountReactivationResponse,
  type ConfirmAccountReactivationMutation,
  type ConfirmAccountReactivationMutationVariables,
  type ConfirmAccountReactivationResponse,
  type CreateRoleMutation,
  type CreateRoleMutationVariables,
  type CreateRoleResponse,
  type DeleteRoleMutation,
  type DeleteRoleMutationVariables,
  type DeleteRoleResponse,
  type SetAccountRolesMutation,
  type SetAccountRolesMutationVariables,
  type SetAccountRolesResponse,
  type SetAccountPermissionsMutation,
  type SetAccountPermissionsMutationVariables,
  type SetAccountPermissionsResponse,
  type SetRolePermissionsMutation,
  type SetRolePermissionsMutationVariables,
  type SetRolePermissionsResponse,
} from "~/generated/graphql";

/**
 * Suspends an account, revoking all active sessions.
 */
defineMutation<SuspendAccountMutationVariables, SuspendAccountResponse>({
  path: "gaia/suspendAccount",
  async handler(body, context) {
    const result = await executeDocument<
      SuspendAccountMutation,
      SuspendAccountMutationVariables
    >(SuspendAccountDocument, body, tokenFrom(context));
    const data = result.data?.gaiaMutations?.suspendAccount;
    if (data == null) {
      throw new MutationError(
        result.error || "Failed to suspend account.",
        result.statusCode,
      );
    }
    return data;
  },
});

/**
 * Re-activates a suspended account.
 */
defineMutation<UnsuspendAccountMutationVariables, UnsuspendAccountResponse>({
  path: "gaia/unsuspendAccount",
  async handler(body, context) {
    const result = await executeDocument<
      UnsuspendAccountMutation,
      UnsuspendAccountMutationVariables
    >(UnsuspendAccountDocument, body, tokenFrom(context));
    const data = result.data?.gaiaMutations?.unsuspendAccount;
    if (data == null) {
      throw new MutationError(
        result.error || "Failed to unsuspend account.",
        result.statusCode,
      );
    }
    return data;
  },
});

/**
 * Deactivates the calling account, revoking its sessions.
 */
defineMutation<DeactivateAccountMutationVariables, DeactivateAccountResponse>({
  path: "gaia/deactivateAccount",
  async handler(body, context) {
    const result = await executeDocument<
      DeactivateAccountMutation,
      DeactivateAccountMutationVariables
    >(DeactivateAccountDocument, body, tokenFrom(context));
    const data = result.data?.gaiaMutations?.deactivateAccount;
    if (data == null) {
      throw new MutationError(
        result.error || "Failed to deactivate account.",
        result.statusCode,
      );
    }
    return data;
  },
});

/**
 * Emails a reactivation link to the given address.
 */
defineMutation<
  RequestAccountReactivationMutationVariables,
  RequestAccountReactivationResponse
>({
  path: "gaia/requestAccountReactivation",
  async handler(body, _context) {
    const result = await executeDocument<
      RequestAccountReactivationMutation,
      RequestAccountReactivationMutationVariables
    >(RequestAccountReactivationDocument, body);
    const data = result.data?.gaiaMutations?.requestAccountReactivation;
    if (data == null) {
      throw new MutationError(
        result.error || "Failed to request reactivation.",
        result.statusCode,
      );
    }
    return data;
  },
});

/**
 * Reactivates an account using a confirmation token.
 */
defineMutation<
  ConfirmAccountReactivationMutationVariables,
  ConfirmAccountReactivationResponse
>({
  path: "gaia/confirmAccountReactivation",
  async handler(body, _context) {
    const result = await executeDocument<
      ConfirmAccountReactivationMutation,
      ConfirmAccountReactivationMutationVariables
    >(ConfirmAccountReactivationDocument, body);
    const data = result.data?.gaiaMutations?.confirmAccountReactivation;
    if (data == null) {
      throw new MutationError(
        result.error || "Failed to confirm reactivation.",
        result.statusCode,
      );
    }
    return data;
  },
});

/**
 * Creates a new role.
 */
defineMutation<CreateRoleMutationVariables, CreateRoleResponse>({
  path: "gaia/createRole",
  async handler(body, context) {
    const result = await executeDocument<
      CreateRoleMutation,
      CreateRoleMutationVariables
    >(CreateRoleDocument, body, tokenFrom(context));
    const data = result.data?.gaiaMutations?.createRole;
    if (data == null) {
      throw new MutationError(
        result.error || "Failed to create role.",
        result.statusCode,
      );
    }
    return data;
  },
});

/**
 * Deletes a role.
 */
defineMutation<DeleteRoleMutationVariables, DeleteRoleResponse>({
  path: "gaia/deleteRole",
  async handler(body, context) {
    const result = await executeDocument<
      DeleteRoleMutation,
      DeleteRoleMutationVariables
    >(DeleteRoleDocument, body, tokenFrom(context));
    const data = result.data?.gaiaMutations?.deleteRole;
    if (data == null) {
      throw new MutationError(
        result.error || "Failed to delete role.",
        result.statusCode,
      );
    }
    return data;
  },
});

/**
 * Replaces the account's roles.
 */
defineMutation<SetAccountRolesMutationVariables, SetAccountRolesResponse>({
  path: "gaia/setAccountRoles",
  async handler(body, context) {
    const result = await executeDocument<
      SetAccountRolesMutation,
      SetAccountRolesMutationVariables
    >(SetAccountRolesDocument, body, tokenFrom(context));
    const data = result.data?.gaiaMutations?.setAccountRoles;
    if (data == null) {
      throw new MutationError(
        result.error || "Failed to set account roles.",
        result.statusCode,
      );
    }
    return data;
  },
});

/**
 * Replaces the account's direct permissions.
 */
defineMutation<
  SetAccountPermissionsMutationVariables,
  SetAccountPermissionsResponse
>({
  path: "gaia/setAccountPermissions",
  async handler(body, context) {
    const result = await executeDocument<
      SetAccountPermissionsMutation,
      SetAccountPermissionsMutationVariables
    >(SetAccountPermissionsDocument, body, tokenFrom(context));
    const data = result.data?.gaiaMutations?.setAccountPermissions;
    if (data == null) {
      throw new MutationError(
        result.error || "Failed to set account permissions.",
        result.statusCode,
      );
    }
    return data;
  },
});

/**
 * Replaces a role's permissions.
 */
defineMutation<SetRolePermissionsMutationVariables, SetRolePermissionsResponse>({
  path: "gaia/setRolePermissions",
  async handler(body, context) {
    const result = await executeDocument<
      SetRolePermissionsMutation,
      SetRolePermissionsMutationVariables
    >(SetRolePermissionsDocument, body, tokenFrom(context));
    const data = result.data?.gaiaMutations?.setRolePermissions;
    if (data == null) {
      throw new MutationError(
        result.error || "Failed to set role permissions.",
        result.statusCode,
      );
    }
    return data;
  },
});
