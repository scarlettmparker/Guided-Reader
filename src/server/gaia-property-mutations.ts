import { defineMutation, makeCacheKey } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import { tokenFrom } from "./context";
import {
  UpsertPropertyEntryDocument,
  SetPropertyDocument,
  type UpsertPropertyEntryMutation,
  type UpsertPropertyEntryMutationVariables,
  type SetPropertyMutation,
  type SetPropertyMutationVariables,
} from "~/generated/graphql";

/**
 * Creates or replaces a property-set entry.
 */
defineMutation({
  path: "gaia/upsertPropertyEntry",
  async handler(body: UpsertPropertyEntryMutationVariables, context) {
    const result = await executeDocument<
      UpsertPropertyEntryMutation,
      UpsertPropertyEntryMutationVariables
    >(UpsertPropertyEntryDocument, body, tokenFrom(context));
    const data = result.data?.gaiaMutations?.upsertPropertyEntry;
    if (!data) {
      return {
        __typename: "StandardError" as const,
        message: result.error || "Failed to save property entry.",
      };
    }
    return {
      __typename: "QuerySuccess" as const,
      message: "Property entry saved.",
      id: data.id,
      invalidated: [
        makeCacheKey("admin/property-sets:propertySetSchemas", {
          ownerKey: body.ownerKey,
        }),
        makeCacheKey("admin/property-sets:propertySetSchemas", {
          ownerKey: "*",
        }),
        makeCacheKey("admin/property-sets/:owner/:name:propertySetEntries", {
          owner: body.ownerKey,
          name: body.name,
        }),
        makeCacheKey("admin/property-sets/:owner/:name:propertySetSchema", {
          owner: body.ownerKey,
          name: body.name,
        }),
      ],
    };
  },
});

/**
 * Sets a single property on an entry.
 */
defineMutation({
  path: "gaia/setProperty",
  async handler(body: SetPropertyMutationVariables, context) {
    const result = await executeDocument<SetPropertyMutation, SetPropertyMutationVariables>(
      SetPropertyDocument,
      body,
      tokenFrom(context),
    );
    const data = result.data?.gaiaMutations?.setProperty;
    if (!data) {
      return {
        __typename: "StandardError" as const,
        message: result.error || "Failed to set property.",
      };
    }
    return {
      __typename: "QuerySuccess" as const,
      message: "Property saved.",
      id: data.id,
      invalidated: [
        makeCacheKey("admin/property-sets/:owner/:name:propertySetEntries", {
          owner: body.ownerKey,
          name: body.name,
        }),
        makeCacheKey("admin/property-sets/:owner/:name:propertySetSchema", {
          owner: body.ownerKey,
          name: body.name,
        }),
      ],
    };
  },
});
