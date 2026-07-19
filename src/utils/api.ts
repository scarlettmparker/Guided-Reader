import { executeDocument } from "@sun/api";
import { PropertySetDocument } from "~/generated/graphql";

export { executeDocument } from "@sun/api";
export type { ApiResponse } from "@sun/api";

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
