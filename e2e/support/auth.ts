import { request } from "@playwright/test";
import { LoginDocument, type LoginMutation } from "../../src/generated/graphql";

import { APP_URL } from "./env";
import { executeGraphql } from "./graphql";

/**
 * Signs in through Gaia and returns the JWT.
 *
 * @param username the login username
 * @param password the login password
 * @returns the backend JWT
 */
export async function loginAs(username: string, password: string): Promise<string> {
  const data = await executeGraphql<LoginMutation>(LoginDocument, {
    input: { username, password },
  });
  const token = data.gaiaMutations.login?.token;
  if (!token) {
    throw new Error("Login failed");
  }

  return token;
}

/**
 * Writes a storage state containing the reader auth cookie.
 *
 * @param token the backend JWT
 * @param path the storage state file to write
 */
export async function saveStorageState(token: string, path: string): Promise<void> {
  const context = await request.newContext();

  try {
    await context.addCookies([
      {
        name: "reader_auth",
        value: token,
        url: APP_URL,
        httpOnly: true,
        secure: APP_URL.startsWith("https://"),
        sameSite: "Lax",
      },
    ]);
    await context.storageState({ path });
  } finally {
    await context.dispose();
  }
}
