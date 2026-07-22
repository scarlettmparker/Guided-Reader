import { defineLoader } from "@sun/ssr";
import { AUTH_COOKIE, getCurrentUser, getCookieValue } from "~/utils/auth";
import { executeDocument } from "~/utils/api";
import { MyRolesDocument, type MyRolesQuery } from "~/generated/graphql";
import { loadLevelColours } from "~/utils/seed-page-data";

/**
 * Resolves the current reader from the request cookie.
 */
defineLoader({
  pattern: "currentUser",
  async loader(_params, context) {
    const token = getCookieValue(context?.cookie, AUTH_COOKIE);
    return { currentUser: await getCurrentUser(token) };
  },
});

/**
 * Resolves the current user's role key strings.
 */
defineLoader({
  pattern: "currentRoles",
  async loader(_params, context) {
    const token = getCookieValue(context?.cookie, AUTH_COOKIE);
    if (!token) return { currentRoles: [] };
    const res = await executeDocument<MyRolesQuery>(MyRolesDocument, {}, token);
    return { currentRoles: res.data?.gaiaQueries?.myRoles ?? [] };
  },
});

/**
 * Resolves the CEFR level -> colour map.
 */
defineLoader({
  pattern: "levelColours",
  async loader() {
    return { levelColours: await loadLevelColours() };
  },
});
