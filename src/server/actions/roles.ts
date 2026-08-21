import { executeMutation } from "@sun/ssr";

/**
 * Creates a new role.
 *
 * @param name the role name
 * @param description the optional description
 * @return the mutation result
 */
export async function createRole(name: string, description?: string) {
  return executeMutation("gaia/createRole", { name, description: description ?? null });
}

/**
 * Deletes a role.
 *
 * @param id the role id
 * @return the mutation result
 */
export async function deleteRole(id: string) {
  return executeMutation("gaia/deleteRole", { id });
}

/**
 * Replaces the account's roles.
 *
 * @param accountId the account id
 * @param roleNames the desired role names
 * @return the mutation result
 */
export async function setAccountRoles(accountId: string, roleNames: string[]) {
  return executeMutation("gaia/setAccountRoles", { accountId, roleNames });
}

/**
 * Replaces the account's direct permissions.
 *
 * @param accountId the account id
 * @param permissions the desired permission strings
 * @return the mutation result
 */
export async function setAccountPermissions(accountId: string, permissions: string[]) {
  return executeMutation("gaia/setAccountPermissions", { accountId, permissions });
}

/**
 * Replaces a role's permissions.
 *
 * @param roleId the role id
 * @param permissions the desired permission strings
 * @return the mutation result
 */
export async function setRolePermissions(roleId: string, permissions: string[]) {
  return executeMutation("gaia/setRolePermissions", { roleId, permissions });
}
