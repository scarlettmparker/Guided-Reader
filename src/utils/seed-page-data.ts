import { getRequestCache, makeCacheKey } from "@sun/ssr";
import { fetchPropertySet } from "~/utils/api";
import type { ReaderAccount } from "~/generated/graphql";

type LevelColours = Record<string, string>;

/**
 * Writes a resolved entry into the current request's page-data cache.
 *
 * @param key the cache key from `makeCacheKey`
 * @param result the merged result object (the entry's data lives under its key)
 */
function seed(key: string, result: Record<string, unknown>): void {
  getRequestCache().set(key, {
    status: "resolved",
    result,
    timestamp: Date.now(),
  });
}

/**
 * Loads the configurable level-to-colour map from gaia.
 *
 * @returns the level name to hex colour map, or empty when unreadable
 */
async function loadLevelColours(): Promise<LevelColours> {
  const res = await fetchPropertySet("ReactApp", "reader-level-colours");
  if (!res.success || !res.data) {
    return {};
  }
  const entries = (res.data as {
    gaiaQueries?: { propertySet?: Record<string, { colour?: string }> };
  })?.gaiaQueries?.propertySet;
  if (!entries) {
    return {};
  }
  const colours: LevelColours = {};
  for (const [name, value] of Object.entries(entries)) {
    if (value?.colour) {
      colours[name] = value.colour;
    }
  }
  return colours;
}

/**
 * Seeds the per-request page-data cache with app-wide entries: the current
 * user (null when unauthenticated) and the level colours. Call within the SSR
 * request, before render.
 *
 * @param user the logged-in reader account, or null
 */
export async function seedPageData(user: ReaderAccount | null): Promise<void> {
  seed(makeCacheKey("currentUser:currentUser", {}), { currentUser: user });
  seed(makeCacheKey("levelColours:levelColours", {}), {
    levelColours: await loadLevelColours(),
  });
}
