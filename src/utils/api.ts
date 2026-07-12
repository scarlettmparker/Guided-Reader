/**
 * Server-only GraphQL runner. Imported solely from loaders, mutation handlers,
 * and the SSR render graph - never from client-bundled code - so the backend
 * endpoint stays out of the client bundle.
 */

import { print, type DocumentNode } from "graphql";
import { PropertySetDocument } from "~/generated/graphql";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
};

/**
 * Executes a typed GraphQL document against the backend.
 */
export async function executeDocument<T, V = Record<string, unknown>>(
  document: DocumentNode,
  variables?: V,
  authToken?: string,
): Promise<ApiResponse<T>> {
  const endpoint =
    process.env.GRAPHQL_ENDPOINT || "http://localhost:8083/graphql";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: print(document), variables }),
    });
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status,
      };
    }
    const result = await response.json();
    if (result.errors) {
      return {
        success: false,
        error: result.errors
          .map((e: { message: string }) => e.message)
          .join(", "),
        statusCode: 400,
      };
    }
    if (!result.data) {
      return { success: false, error: "No data returned", statusCode: 400 };
    }
    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      statusCode: 500,
    };
  }
}

/**
 * Fetches a property set entry's values, or every entry when entry is omitted.
 */
export async function fetchPropertySet(
  ownerKey: string,
  name: string,
  entry?: string,
) {
  return executeDocument(PropertySetDocument, {
    ownerKey,
    name,
    entry: entry ?? null,
  });
}
