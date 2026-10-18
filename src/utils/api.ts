import {
  executeDocument as runDocument,
  type ApiResponse,
  type ExecuteOptions,
} from "@sun/api";
import type { DocumentNode } from "graphql";
import { PropertySetDocument } from "~/generated/graphql";

export type { ApiResponse } from "@sun/api";

/**
 * Reads the first operation name out of a document.
 *
 * @param document - The GraphQL document.
 * @returns The operation name, or "anonymous" when it has none.
 */
function operationName(document: DocumentNode): string {
  for (const definition of document.definitions) {
    if (definition.kind === "OperationDefinition" && definition.name) {
      return definition.name.value;
    }
  }
  return "anonymous";
}

/**
 * Runs a document against the backend, logging the operation whenever it fails.
 *
 * @param document - The operation to run.
 * @param variables - Variables for the operation.
 * @param authToken - Bearer token, when the caller has one.
 * @param options - Retry and timeout overrides.
 * @returns The api response, successful or not.
 */
export async function executeDocument<T, V = Record<string, unknown>>(
  document: DocumentNode,
  variables?: V,
  authToken?: string,
  options?: ExecuteOptions,
): Promise<ApiResponse<T>> {
  const started = Date.now();
  const result = await runDocument<T, V>(document, variables, authToken, {
    timeoutMs: 5000,
    retries: [250, 750],
    ...options,
  });
  if (!result.success) {
    const token = authToken ? "" : " (no token)";
    console.error(
      `[api] ${operationName(document)} failed: ${result.statusCode ?? "no status"} ${result.error}${token} [${Date.now() - started}ms]`,
    );
  }
  return result;
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
