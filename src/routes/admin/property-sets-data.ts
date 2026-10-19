import { defineLoader } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import { getCookieValue } from "~/utils/auth";
import { AUTH_COOKIE } from "~/utils/auth";
import {
  PropertySetSchemasDocument,
  PropertySetsDocument,
  PropertySetSchemaDocument,
  type PropertySetSchemasQuery,
  type PropertySetSchemasQueryVariables,
  type PropertySetsQuery,
  type PropertySetsQueryVariables,
  type PropertySetSchemaQuery,
  type PropertySetSchemaQueryVariables,
} from "~/generated/graphql";

/**
 * Loads all property-set schemas.
 */
defineLoader({
  pattern: "admin/property-sets",
  async loader(_params, context) {
    const token = getCookieValue(context?.cookie, AUTH_COOKIE);
    try {
      const result = await executeDocument<
        PropertySetSchemasQuery,
        PropertySetSchemasQueryVariables
      >(PropertySetSchemasDocument, {}, token ?? undefined);
      const items = result.data?.gaiaQueries?.propertySetSchemas ?? [];
      return { propertySetSchemas: items };
    } catch {
      return { propertySetSchemas: [] };
    }
  },
});

/**
 * Loads all entries for a property set.
 */
defineLoader({
  pattern: "admin/property-sets/:owner/:name",
  async loader(params, context) {
    const owner = params.owner as string;
    const name = params.name as string;
    if (!owner || !name) return { propertySetEntries: [], propertySetSchema: null };
    const token = getCookieValue(context?.cookie, AUTH_COOKIE);
    try {
      const [entriesResult, schemaResult] = await Promise.all([
        executeDocument<PropertySetsQuery, PropertySetsQueryVariables>(
          PropertySetsDocument,
          { ownerKey: owner, name },
          token ?? undefined,
        ),
        executeDocument<PropertySetSchemaQuery, PropertySetSchemaQueryVariables>(
          PropertySetSchemaDocument,
          { ownerKey: owner, name },
          token ?? undefined,
        ),
      ]);
      return {
        propertySetEntries: entriesResult.data?.gaiaQueries?.propertySets ?? [],
        propertySetSchema: schemaResult.data?.gaiaQueries?.propertySetSchema ?? null,
      };
    } catch {
      return { propertySetEntries: [], propertySetSchema: null };
    }
  },
});
