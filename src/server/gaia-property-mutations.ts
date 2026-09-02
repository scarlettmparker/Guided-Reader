import { defineMutation, makeCacheKey } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import { tokenFrom } from "./context";
import {
  UpsertPropertyEntryDocument,
  SetPropertyDocument,
  RegisterPropertySetSchemaDocument,
  DeletePropertyEntryDocument,
  type UpsertPropertyEntryMutation,
  type UpsertPropertyEntryMutationVariables,
  type SetPropertyMutation,
  type SetPropertyMutationVariables,
  type RegisterPropertySetSchemaMutation,
  type RegisterPropertySetSchemaMutationVariables,
  type DeletePropertyEntryMutation,
  type DeletePropertyEntryMutationVariables,
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
        makeCacheKey("admin/property-sets:propertySetSchemas", {}),
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

/**
 * Registers a property-set schema.
 */
defineMutation({
  path: "gaia/registerPropertySetSchema",
  async handler(body: RegisterPropertySetSchemaMutationVariables, context) {
    const result = await executeDocument<
      RegisterPropertySetSchemaMutation,
      RegisterPropertySetSchemaMutationVariables
    >(RegisterPropertySetSchemaDocument, body, tokenFrom(context));
    const data = result.data?.gaiaMutations?.registerPropertySetSchema;
    if (!data) {
      return {
        __typename: "StandardError" as const,
        message: result.error || "Failed to save schema.",
      };
    }
    return {
      __typename: "QuerySuccess" as const,
      message: "Schema saved.",
      id: data.id,
      invalidated: [
        makeCacheKey("admin/property-sets:propertySetSchemas", {}),
        makeCacheKey("admin/property-sets/:owner/:name:propertySetSchema", {
          owner: body.input.ownerKey ?? "",
          name: body.input.name,
        }),
      ],
    };
  },
});

/**
 * Deletes a property-set entry.
 */
defineMutation({
  path: "gaia/deletePropertyEntry",
  async handler(body: DeletePropertyEntryMutationVariables, context) {
    const result = await executeDocument<
      DeletePropertyEntryMutation,
      DeletePropertyEntryMutationVariables
    >(DeletePropertyEntryDocument, body, tokenFrom(context));
    const data = result.data?.gaiaMutations?.deletePropertyEntry;
    if (!data) {
      return {
        __typename: "StandardError" as const,
        message: result.error || "Failed to delete entry.",
      };
    }
    if (data.__typename === "StandardError") {
      return data;
    }
    return {
      ...data,
      invalidated: [
        makeCacheKey("admin/property-sets:propertySetSchemas", {}),
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
