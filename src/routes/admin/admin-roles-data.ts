import { defineLoader } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import { AUTH_COOKIE, getCookieValue } from "~/utils/auth";
import {
  AccountPermissionsDocument,
  AccountRolesDocument,
  AllPermissionsDocument,
  RolePermissionsDocument,
  RolesDocument,
  type AccountPermissionsQuery,
  type AccountPermissionsQueryVariables,
  type AccountRolesQuery,
  type AccountRolesQueryVariables,
  type AllPermissionsQuery,
  type AllPermissionsQueryVariables,
  type RolePermissionsQuery,
  type RolePermissionsQueryVariables,
  type RolesQuery,
  type RolesQueryVariables,
} from "~/generated/graphql";

/**
 * Lists all roles ordered by name.
 */
defineLoader({
  pattern: "admin/roles",
  async loader(_params, context) {
    const token = getCookieValue(context?.cookie, AUTH_COOKIE);
    if (!token) return { roles: [] };
    try {
      const result = await executeDocument<RolesQuery, RolesQueryVariables>(
        RolesDocument,
        {},
        token,
      );
      return { roles: result.data?.gaiaQueries?.roles ?? [] };
    } catch {
      return { roles: [] };
    }
  },
});

/**
 * Lists direct role names for the account.
 */
defineLoader({
  pattern: "admin/:id/roles",
  async loader(params, context) {
    const accountId = params.id as string;
    if (!accountId) return { accountRoles: [] };
    const token = getCookieValue(context?.cookie, AUTH_COOKIE);
    if (!token) return { accountRoles: [] };
    try {
      const result = await executeDocument<
        AccountRolesQuery,
        AccountRolesQueryVariables
      >(AccountRolesDocument, { accountId }, token);
      return { accountRoles: result.data?.gaiaQueries?.accountRoles ?? [] };
    } catch {
      return { accountRoles: [] };
    }
  },
});

/**
 * Lists direct permission strings for the account.
 */
defineLoader({
  pattern: "admin/:id/permissions",
  async loader(params, context) {
    const accountId = params.id as string;
    if (!accountId) return { accountPermissions: [] };
    const token = getCookieValue(context?.cookie, AUTH_COOKIE);
    if (!token) return { accountPermissions: [] };
    try {
      const result = await executeDocument<
        AccountPermissionsQuery,
        AccountPermissionsQueryVariables
      >(AccountPermissionsDocument, { accountId }, token);
      return {
        accountPermissions: result.data?.gaiaQueries?.accountPermissions ?? [],
      };
    } catch {
      return { accountPermissions: [] };
    }
  },
});

/**
 * Lists permission strings for the role.
 */
defineLoader({
  pattern: "admin/roles/:id/permissions",
  async loader(params, context) {
    const roleId = params.id as string;
    if (!roleId) return { rolePermissions: [] };
    const token = getCookieValue(context?.cookie, AUTH_COOKIE);
    if (!token) return { rolePermissions: [] };
    try {
      const result = await executeDocument<
        RolePermissionsQuery,
        RolePermissionsQueryVariables
      >(RolePermissionsDocument, { roleId }, token);
      return {
        rolePermissions: result.data?.gaiaQueries?.rolePermissions ?? [],
      };
    } catch {
      return { rolePermissions: [] };
    }
  },
});

/**
 * Lists all distinct permissions.
 */
defineLoader({
  pattern: "admin/all-permissions",
  async loader(_params, context) {
    const token = getCookieValue(context?.cookie, AUTH_COOKIE);
    if (!token) return { allPermissions: [] };
    try {
      const result = await executeDocument<
        AllPermissionsQuery,
        AllPermissionsQueryVariables
      >(AllPermissionsDocument, {}, token);
      return { allPermissions: result.data?.gaiaQueries?.allPermissions ?? [] };
    } catch {
      return { allPermissions: [] };
    }
  },
});
