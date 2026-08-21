import { useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, CardBody, CardHeader, CardTitle } from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import type { RolesQuery, AccountRolesQuery } from "~/generated/graphql";
import { setAccountRoles } from "~/server/actions/roles";
import AccountRoleTransferList from "./account-role-transfer-list";
import styles from "./account-role-editor.module.css";

type RolesData = RolesQuery["gaiaQueries"]["roles"];
type AccountRolesData = AccountRolesQuery["gaiaQueries"]["accountRoles"];

type AccountRoleEditorProps = {
  /**
   * Account ID to edit.
   */
  accountId: string;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Stacked card for account-scoped role assignment with replace semantics.
 */
const AccountRoleEditor = (props: AccountRoleEditorProps) => {
  const { accountId, className, ...rest } = props;
  const { t } = useTranslation("admin");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { data: roles } = usePageData<RolesData>("roles", "admin/roles", {});
  const { data: accountRoles } = usePageData<AccountRolesData>(
    "accountRoles",
    "admin/:id/roles",
    { id: accountId },
  );

  const assigned = [...(accountRoles ?? [])].sort((a, b) => a.localeCompare(b));
  const [draft, setDraft] = useState<string[]>(assigned);

  useEffect(() => {
    setDraft(assigned);
  }, [assigned.join(",")]);

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await setAccountRoles(accountId, draft) as { __typename?: string; message?: string };
      if (result?.__typename === "StandardError") {
        setError(result.message ?? "Failed to save roles.");
      }
    });
  };

  const hasChanges =
    draft.length !== assigned.length || draft.some((v, i) => v !== assigned[i]);

  return (
    <Card className={className} {...rest}>
      <CardHeader>
        <CardTitle>{t("roles-title")}</CardTitle>
      </CardHeader>
      <CardBody>
        <section className={styles.editor_body}>
          <AccountRoleTransferList roles={roles ?? []} assignedRoleNames={draft} onChange={setDraft} />
          {error && <p className={styles.error}>{error}</p>}
          <section className={styles.footer}>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isPending}
              title={t("save-roles")}
              aria-label={t("save-roles")}
            >
              {isPending ? t("saving") : t("save-roles")}
            </Button>
          </section>
        </section>
      </CardBody>
    </Card>
  );
};

export default AccountRoleEditor;
