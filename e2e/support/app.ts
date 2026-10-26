import { expect, type APIRequestContext } from "@playwright/test";

import { APP_URL } from "./env";

/**
 * Clears the app's in-memory SSR caches.
 *
 * @param context the request context bound to the app
 */
export async function resetAppCache(context: APIRequestContext): Promise<void> {
  await context.get("/login");

  const cookies = await context.cookies(APP_URL);
  const csrfToken = cookies.find((cookie) => cookie.name === "csrf_token")?.value;
  expect(csrfToken).toBeTruthy();

  const response = await context.post("/__reset-cache", {
    headers: { "x-csrf-token": csrfToken ?? "" },
  });
  expect(response.ok()).toBeTruthy();
}
