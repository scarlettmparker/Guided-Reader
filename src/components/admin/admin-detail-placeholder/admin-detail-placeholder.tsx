import { Card, CardBody } from "@sun/components";
import { WrenchOutline } from "preact-heroicons";
import { useTranslation } from "@sun/i18n";
import styles from "./admin-detail-placeholder.module.css";

/**
 * Placeholder shown in the admin detail panel when no account is selected.
 */
const AdminDetailPlaceholder = () => {
  const { t } = useTranslation("admin");

  return (
    <Card>
      <CardBody className={styles.placeholder_body}>
        <WrenchOutline width={48} height={48} />
        <p>{t("select-user")}</p>
      </CardBody>
    </Card>
  );
};

export default AdminDetailPlaceholder;
