import { Card, CardBody } from "@sun/components";
import { WrenchOutline } from "preact-heroicons";
import { useTranslation } from "@sun/i18n";
import styles from "./property-sets-placeholder.module.css";

/**
 * Placeholder shown when no property set is selected.
 */
const PropertySetsPlaceholder = () => {
  const { t } = useTranslation("admin");

  return (
    <Card>
      <CardBody className={styles.placeholder_body}>
        <WrenchOutline width={48} height={48} />
        <p>{t("select-property-set")}</p>
      </CardBody>
    </Card>
  );
};

export default PropertySetsPlaceholder;
