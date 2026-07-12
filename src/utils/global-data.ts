import { pageDataRegistry } from "@sun/ssr";
import { AUTH_COOKIE, getCurrentUser, getCookieValue } from "~/utils/auth";
import { loadLevelColours } from "~/utils/seed-page-data";

type CookieContext = { cookie?: string };

/**
 * Resolves the current reader from the request cookie.
 */
async function getCurrentUserData(
  _params: Record<string, unknown> | undefined,
  context?: CookieContext,
): Promise<Record<string, unknown> | null> {
  const token = getCookieValue(context?.cookie, AUTH_COOKIE);
  const user = await getCurrentUser(token);
  return { currentUser: user };
}

async function getLevelColoursData(): Promise<Record<string, unknown> | null> {
  return { levelColours: await loadLevelColours() };
}

/**
 * Registers the app-wide data loaders that are also seeded during SSR.
 */
export function registerGlobalDataLoaders(): void {
  pageDataRegistry.registerPageDataLoader("currentUser", getCurrentUserData);
  pageDataRegistry.registerPageDataLoader("levelColours", getLevelColoursData);
}
