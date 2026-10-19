import { executeMutation } from "@sun/ssr";
import type {
  CreateRoleResponse,
  DeleteRoleResponse,
  SetAccountPermissionsResponse,
  SetAccountRolesResponse,
  SetRolePermissionsResponse,
  SuspendAccountResponse,
  UnsuspendAccountResponse,
} from "~/generated/graphql";

/**
 * Creates a new role.
 *
 * @param name the role name
 * @param description the optional description
 * @return the mutation result
 */
export async function createRole(name: string, description?: string): Promise<CreateRoleResponse> {
  return executeMutation<CreateRoleResponse>("gaia/createRole", {
    name,
    description: description ?? null,
  });
}

/**
 * Deletes a role.
 *
 * @param id the role id
 * @return the mutation result
 */
export async function deleteRole(id: string): Promise<DeleteRoleResponse> {
  return executeMutation<DeleteRoleResponse>("gaia/deleteRole", { id });
}

/**
 * Replaces the account's roles.
 *
 * @param accountId the account id
 * @param roleNames the desired role names
 * @return the mutation result
 */
export async function setAccountRoles(
  accountId: string,
  roleNames: string[],
): Promise<SetAccountRolesResponse> {
  return executeMutation<SetAccountRolesResponse>("gaia/setAccountRoles", {
    accountId,
    roleNames,
  });
}

/**
 * Replaces the account's direct permissions.
 *
 * @param accountId the account id
 * @param permissions the desired permission strings
 * @return the mutation result
 */
export async function setAccountPermissions(
  accountId: string,
  permissions: string[],
): Promise<SetAccountPermissionsResponse> {
  return executeMutation<SetAccountPermissionsResponse>("gaia/setAccountPermissions", {
    accountId,
    permissions,
  });
}

/**
 * Replaces a role's permissions.
 *
 * @param roleId the role id
 * @param permissions the desired permission strings
 * @return the mutation result
 */
export async function setRolePermissions(
  roleId: string,
  permissions: string[],
): Promise<SetRolePermissionsResponse> {
  return executeMutation<SetRolePermissionsResponse>("gaia/setRolePermissions", {
    roleId,
    permissions,
  });
}

/**
 * Suspends an account.
 *
 * @param id the account id
 * @return the mutation result
 */
export async function suspendAccount(id: string): Promise<SuspendAccountResponse> {
  return executeMutation<SuspendAccountResponse>("gaia/suspendAccount", { id });
}

/**
 * Unsuspends an account.
 *
 * @param id the account id
 * @return the mutation result
 */
export async function unsuspendAccount(id: string): Promise<UnsuspendAccountResponse> {
  return executeMutation<UnsuspendAccountResponse>("gaia/unsuspendAccount", {
    id,
  });
}
