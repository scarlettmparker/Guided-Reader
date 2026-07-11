import { useTranslation } from "react-i18next";
import { Card, CardBody } from "@sun/components";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import styles from "./text-detail-placeholder.module.css";

/**
 * Placeholder shown in the detail panel when no text is selected.
 */
const TextDetailPlaceholder = () => {
  const { t } = useTranslation("texts");

  return (
    <Card>
      <CardBody className={styles.placeholder_body}>
        <BookOpenIcon width={48} height={48} />
        <p className={styles.text}>{t("select-text")}</p>
      </CardBody>
    </Card>
  );
};

export default TextDetailPlaceholder;
