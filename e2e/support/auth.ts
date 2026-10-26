import { request } from "@playwright/test";

import { APP_URL, BACKEND_URL } from "./env";

type LoginResponse = {
  /**
   * GraphQL errors returned by the backend.
   */
  errors?: Array<{ message: string }>;
  /**
   * Successful login payload.
   */
  data?: {
    /**
     * Gaia mutation result.
     */
    gaiaMutations: {
      /**
       * Issued JWT, or null when the credentials were rejected.
       */
      login: { token: string } | null;
    };
  };
};

const LOGIN_MUTATION = `mutation E2eLogin($username: String!, $password: String!) {
  gaiaMutations {
    login(input: { username: $username, password: $password }) {
      token
    }
  }
}`;

/**
 * Signs in through Gaia and returns the JWT.
 *
 * @param username the login username
 * @param password the login password
 * @returns the backend JWT
 */
export async function loginAs(username: string, password: string): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/graphql`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: LOGIN_MUTATION,
      variables: { username, password },
    }),
  });
  const payload = (await response.json()) as LoginResponse;

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join(", "));
  }
  const token = payload.data?.gaiaMutations.login?.token;
  if (!token) {
    throw new Error(`Login failed with ${response.status}`);
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
