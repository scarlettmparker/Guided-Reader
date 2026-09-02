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
 * Loads all property-set schemas for an owner.
 */
defineLoader({
  pattern: "admin/property-sets",
  async loader(params, context) {
    const ownerKey = (params.ownerKey as string | undefined) ?? "Knowledge";
    const token = getCookieValue(context?.cookie, AUTH_COOKIE);
    if (!token) return { propertySetSchemas: [] };
    try {
      const result = await executeDocument<
        PropertySetSchemasQuery,
        PropertySetSchemasQueryVariables
      >(PropertySetSchemasDocument, { ownerKey }, token);
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
    if (!token) return { propertySetEntries: [], propertySetSchema: null };
    try {
      const [entriesResult, schemaResult] = await Promise.all([
        executeDocument<PropertySetsQuery, PropertySetsQueryVariables>(
          PropertySetsDocument,
          { ownerKey: owner, name },
          token,
        ),
        executeDocument<PropertySetSchemaQuery, PropertySetSchemaQueryVariables>(
          PropertySetSchemaDocument,
          { ownerKey: owner, name },
          token,
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
