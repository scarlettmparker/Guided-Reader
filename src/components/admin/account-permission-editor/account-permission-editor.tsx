import { useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, CardBody, CardHeader, CardTitle } from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import type { AccountPermissionsQuery } from "~/generated/graphql";
import { setAccountPermissions } from "~/server/actions/roles";
import AccountPermissionList from "./account-permission-list";
import styles from "./account-permission-editor.module.css";

type AccountPermissionsData =
  AccountPermissionsQuery["gaiaQueries"]["accountPermissions"];

type AccountPermissionEditorProps = {
  /**
   * Account ID to edit.
   */
  accountId: string;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Stacked card for account-scoped direct permission assignment.
 */
const AccountPermissionEditor = (props: AccountPermissionEditorProps) => {
  const { accountId, className, ...rest } = props;
  const { t } = useTranslation("admin");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { data: accountPermissions } = usePageData<AccountPermissionsData>(
    "accountPermissions",
    "admin/:id/permissions",
    { id: accountId },
  );

  const assigned = [...(accountPermissions ?? [])].sort((a, b) =>
    a.localeCompare(b),
  );
  const [draft, setDraft] = useState<string[]>(assigned);

  useEffect(() => {
    setDraft(assigned);
  }, [assigned.join(",")]);

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = (await setAccountPermissions(accountId, draft)) as {
        __typename?: string;
        message?: string;
      };
      if (result?.__typename === "StandardError") {
        setError(result.message ?? "Failed to save permissions.");
      }
    });
  };

  const hasChanges =
    draft.length !== assigned.length || draft.some((v, i) => v !== assigned[i]);

  return (
    <Card className={className} {...rest}>
      <CardHeader>
        <CardTitle>{t("permissions-title")}</CardTitle>
      </CardHeader>
      <CardBody>
        <section className={styles.editor_body}>
          <AccountPermissionList
            assignedPermissions={draft}
            onChange={setDraft}
          />
          {error && <p className={styles.error}>{error}</p>}
          <section className={styles.footer}>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isPending}
              title={t("save-permissions")}
              aria-label={t("save-permissions")}
            >
              {isPending ? t("saving") : t("save-permissions")}
            </Button>
          </section>
        </section>
      </CardBody>
    </Card>
  );
};

export default AccountPermissionEditor;
