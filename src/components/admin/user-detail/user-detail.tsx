import { useTranslation } from "react-i18next";
import { Card, CardBody, CardHeader, CardTitle } from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import type { AccountQuery } from "~/generated/graphql";
import styles from "./user-detail.module.css";

type AccountData = AccountQuery["gaiaQueries"]["account"];

type AdminUserDetailProps = {
  /**
   * Account ID to display.
   */
  accountId: string;
};

/**
 * Displays an account's fields in the admin detail panel.
 */
const AdminUserDetail = ({ accountId }: AdminUserDetailProps) => {
  const { t } = useTranslation("admin");
  const { data: account } = usePageData<AccountData>("account", "admin/:id", {
    id: accountId,
  });

  if (!account) {
    return <p>{t("user-not-found")}</p>;
  }

  const isSuspended = account.status === "SUSPENDED";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{account.username}</CardTitle>
      </CardHeader>
      <CardBody className={styles.detail_body}>
        <label>{t("status")}</label>
        <p className={styles.detail_value}>
          {isSuspended ? t("status-suspended") : t("status-active")}
        </p>
        <label>{t("provider")}</label>
        <p className={styles.detail_value}>{account.provider ?? t("none")}</p>
        <label>{t("created")}</label>
        <p className={styles.detail_value}>{account.createdAt ?? t("unknown")}</p>
        <label>{t("updated")}</label>
        <p className={styles.detail_value}>{account.updatedAt ?? t("unknown")}</p>
        {account.remoteUsers && account.remoteUsers.length > 0 && (
          <>
            <label>{t("remote-accounts")}</label>
            <div className={styles.detail_value}>
              {account.remoteUsers.map((ru, i) => (
                <p key={i}>{ru.type}: {ru.id}</p>
              ))}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default AdminUserDetail;
