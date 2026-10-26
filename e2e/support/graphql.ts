import { print, type DocumentNode } from "graphql";

import { BACKEND_URL } from "./env";

type GraphQlResponse<T> = {
  /**
   * GraphQL errors returned by the backend.
   */
  errors?: Array<{ message: string }>;
  /**
   * Successful operation payload.
   */
  data?: T;
};

/**
 * Runs a generated GraphQL document against the E2E backend.
 *
 * @param document the generated operation
 * @param variables the operation variables
 * @param token an optional backend JWT
 * @returns the operation payload
 */
export async function executeGraphql<T>(
  document: DocumentNode,
  variables: Record<string, unknown> = {},
  token?: string,
): Promise<T> {
  const response = await fetch(`${BACKEND_URL}/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query: print(document), variables }),
  });
  const payload = (await response.json()) as GraphQlResponse<T>;

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join(", "));
  }
  if (!payload.data) {
    throw new Error(`GraphQL request failed with ${response.status}`);
  }

  return payload.data;
}
