import { useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, CardBody, CardHeader, CardTitle } from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import type { RolePermissionsQuery } from "~/generated/graphql";
import { setRolePermissions } from "~/server/actions/roles";
import RolePermissionList from "./role-permission-list";
import styles from "./role-permission-editor.module.css";

type RolePermissionsData = RolePermissionsQuery["gaiaQueries"]["rolePermissions"];

type RolePermissionEditorProps = {
  /**
   * Role ID to edit.
   */
  roleId: string;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Card for role-scoped permission assignment.
 */
const RolePermissionEditor = (props: RolePermissionEditorProps) => {
  const { roleId, className, ...rest } = props;
  const { t } = useTranslation("admin");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { data: rolePermissions } = usePageData<RolePermissionsData>(
    "rolePermissions",
    "admin/roles/:id/permissions",
    { id: roleId },
  );

  const assigned = [...(rolePermissions ?? [])].sort((a, b) => a.localeCompare(b));
  const [draft, setDraft] = useState<string[]>(assigned);

  useEffect(() => {
    setDraft(assigned);
  }, [assigned.join(",")]);

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await setRolePermissions(roleId, draft) as { __typename?: string; message?: string };
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
        <CardTitle>{t("role-permissions-title")}</CardTitle>
      </CardHeader>
      <CardBody>
        <section className={styles.editor_body}>
          <RolePermissionList assignedPermissions={draft} onChange={setDraft} />
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

export default RolePermissionEditor;
