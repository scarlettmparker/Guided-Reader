import { Card, CardBody } from "@sun/components";
import { WrenchIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import styles from "./property-sets-placeholder.module.css";

/**
 * Placeholder shown when no property set is selected.
 */
const PropertySetsPlaceholder = () => {
  const { t } = useTranslation("admin");

  return (
    <Card>
      <CardBody className={styles.placeholder_body}>
        <WrenchIcon width={48} height={48} />
        <p>{t("select-property-set")}</p>
      </CardBody>
    </Card>
  );
};

export default PropertySetsPlaceholder;
