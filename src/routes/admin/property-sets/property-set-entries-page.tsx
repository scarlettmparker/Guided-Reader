import { useParams } from "react-router-dom";
import PropertySetSchemaEditor from "~/components/admin/property-sets/property-set-schema-editor";
import PropertySetEntries from "~/components/admin/property-sets/property-set-entries";
import styles from "./property-set-entries-page.module.css";

/**
 * Detail outlet for a single property set.
 */
const PropertySetEntriesPage = () => {
  const { owner, name } = useParams<{ owner: string; name: string }>();
  if (!owner || !name) return null;
  return (
    <div className={styles.detail}>
      <PropertySetSchemaEditor owner={owner} name={name} />
      <PropertySetEntries owner={owner} name={name} />
    </div>
  );
};

export default PropertySetEntriesPage;
