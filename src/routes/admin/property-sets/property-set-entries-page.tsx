import { useParams } from "react-router-dom";
import PropertySetEntries from "~/components/admin/property-sets/property-set-entries";

/**
 * Detail outlet for a single property set.
 */
const PropertySetEntriesPage = () => {
  const { owner, name } = useParams<{ owner: string; name: string }>();
  if (!owner || !name) return null;
  return <PropertySetEntries owner={owner} name={name} />;
};

export default PropertySetEntriesPage;
