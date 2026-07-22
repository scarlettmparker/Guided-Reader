import { Card, CardBody } from "@sun/components";
import { WrenchIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import styles from "./admin-detail-placeholder.module.css";

/**
 * Placeholder shown in the admin detail panel when no account is selected.
 */
const AdminDetailPlaceholder = () => {
  const { t } = useTranslation("admin");

  return (
    <Card>
      <CardBody className={styles.placeholder_body}>
        <WrenchIcon width={48} height={48} />
        <p>{t("select-user")}</p>
      </CardBody>
    </Card>
  );
};

export default AdminDetailPlaceholder;
