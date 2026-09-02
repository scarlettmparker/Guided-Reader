import { Suspense } from "react";
import PropertySetSchemaEditorContent from "~/components/admin/property-sets/property-set-schema-editor-content";
import { PropertySetSchemaEditorSkeleton } from "./skeletons";

type PropertySetSchemaEditorProps = {
  /**
   * Owner key of the schema.
   */
  owner: string;
  /**
   * Name of the schema.
   */
  name: string;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Card for editing a property-set schema.
 */
const PropertySetSchemaEditor = (props: PropertySetSchemaEditorProps) => {
  const { owner, name } = props;

  return (
    <Suspense fallback={<PropertySetSchemaEditorSkeleton />}>
      <PropertySetSchemaEditorContent owner={owner} name={name} />
    </Suspense>
  );
};

export default PropertySetSchemaEditor;
