import { defineMutation, MutationError } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import { tokenFrom } from "./context";
import {
  UpsertPropertyEntryDocument,
  SetPropertyDocument,
  RegisterPropertySetSchemaDocument,
  DeletePropertyEntryDocument,
  type UpsertPropertyEntryMutation,
  type UpsertPropertyEntryMutationVariables,
  type UpsertPropertyEntryResponse,
  type SetPropertyMutation,
  type SetPropertyMutationVariables,
  type SetPropertyResponse,
  type RegisterPropertySetSchemaMutation,
  type RegisterPropertySetSchemaMutationVariables,
  type RegisterPropertySetSchemaResponse,
  type DeletePropertyEntryMutation,
  type DeletePropertyEntryMutationVariables,
  type DeletePropertyEntryResponse,
} from "~/generated/graphql";

/**
 * Creates or replaces a property-set entry.
 */
defineMutation<UpsertPropertyEntryMutationVariables, UpsertPropertyEntryResponse>({
  path: "gaia/upsertPropertyEntry",
  async handler(body, context) {
    const result = await executeDocument<
      UpsertPropertyEntryMutation,
      UpsertPropertyEntryMutationVariables
    >(UpsertPropertyEntryDocument, body, tokenFrom(context));
    const data = result.data?.gaiaMutations?.upsertPropertyEntry;
    if (data == null) {
      throw new MutationError(result.error || "Failed to save property entry.", result.statusCode);
    }
    return data;
  },
});

/**
 * Sets a single property on an entry.
 */
defineMutation<SetPropertyMutationVariables, SetPropertyResponse>({
  path: "gaia/setProperty",
  async handler(body, context) {
    const result = await executeDocument<SetPropertyMutation, SetPropertyMutationVariables>(
      SetPropertyDocument,
      body,
      tokenFrom(context),
    );
    const data = result.data?.gaiaMutations?.setProperty;
    if (data == null) {
      throw new MutationError(result.error || "Failed to set property.", result.statusCode);
    }
    return data;
  },
});

/**
 * Registers a property-set schema.
 */
defineMutation<RegisterPropertySetSchemaMutationVariables, RegisterPropertySetSchemaResponse>({
  path: "gaia/registerPropertySetSchema",
  async handler(body, context) {
    const result = await executeDocument<
      RegisterPropertySetSchemaMutation,
      RegisterPropertySetSchemaMutationVariables
    >(RegisterPropertySetSchemaDocument, body, tokenFrom(context));
    const data = result.data?.gaiaMutations?.registerPropertySetSchema;
    if (data == null) {
      throw new MutationError(result.error || "Failed to save schema.", result.statusCode);
    }
    return data;
  },
});

/**
 * Deletes a property-set entry.
 */
defineMutation<DeletePropertyEntryMutationVariables, DeletePropertyEntryResponse>({
  path: "gaia/deletePropertyEntry",
  async handler(body, context) {
    const result = await executeDocument<
      DeletePropertyEntryMutation,
      DeletePropertyEntryMutationVariables
    >(DeletePropertyEntryDocument, body, tokenFrom(context));
    const data = result.data?.gaiaMutations?.deletePropertyEntry;
    if (data == null) {
      throw new MutationError(result.error || "Failed to delete entry.", result.statusCode);
    }
    return data;
  },
});
