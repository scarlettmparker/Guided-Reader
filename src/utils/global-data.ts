import { defineLoader } from "@sun/ssr";
import { AUTH_COOKIE, getCurrentUser, getCookieValue } from "~/utils/auth";
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
 * Resolves the CEFR level -> colour map.
 */
defineLoader({
  pattern: "levelColours",
  async loader() {
    return { levelColours: await loadLevelColours() };
  },
});
