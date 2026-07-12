import { type MutationContext } from "@sun/ssr";
import { AUTH_COOKIE, getCookieValue } from "~/utils/auth";

/**
 * Extracts the caller's JWT from the request cookie header.
 */
export function tokenFrom(context: MutationContext): string | undefined {
  return getCookieValue(context.cookie, AUTH_COOKIE);
}
