import { executeMutation } from "@sun/ssr";

/**
 * Creates or replaces a property-set entry.
 *
 * @param ownerKey the owner key
 * @param name the property set name
 * @param entry the entry name
 * @param values the values to store
 * @return the mutation result
 */
export async function upsertPropertyEntry(
  ownerKey: string,
  name: string,
  entry: string,
  values: Record<string, unknown>,
) {
  return executeMutation("gaia/upsertPropertyEntry", {
    ownerKey,
    name,
    entry,
    input: { values },
  });
}

/**
 * Sets a single property on an entry.
 *
 * @param ownerKey the owner key
 * @param name the property set name
 * @param entry the entry name
 * @param property the property name
 * @param value the property value
 * @return the mutation result
 */
export async function setProperty(
  ownerKey: string,
  name: string,
  entry: string,
  property: string,
  value: unknown,
) {
  return executeMutation("gaia/setProperty", {
    ownerKey,
    name,
    entry,
    input: { property, value },
  });
}

/**
 * Registers a property-set schema.
 *
 * @param input the schema input
 * @return the mutation result
 */
export async function registerPropertySetSchema(input: {
  ownerKey?: string | null;
  name: string;
  configurable?: boolean | null;
  properties: Record<string, unknown>;
}) {
  return executeMutation("gaia/registerPropertySetSchema", { input });
}

/**
 * Deletes a property-set entry.
 *
 * @param ownerKey the owner key
 * @param name the property set name
 * @param entry the entry name
 * @return the mutation result
 */
export async function deletePropertyEntry(
  ownerKey: string,
  name: string,
  entry: string,
) {
  return executeMutation("gaia/deletePropertyEntry", { ownerKey, name, entry });
}
