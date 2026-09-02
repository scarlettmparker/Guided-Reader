import { useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  JsonTextArea,
} from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import type { PropertySetSchema } from "~/generated/graphql";
import { registerPropertySetSchema } from "~/server/actions/propertySets";
import styles from "./property-set-schema-editor-content.module.css";
import { CardFooter } from "@sun/components";

type PropertySetSchemaEditorContentProps = {
  /**
   * Owner key of the schema.
   */
  owner: string;
  /**
   * Name of the schema.
   */
  name: string;
};

/**
 * Editable JSON for a property-set schema.
 */
const PropertySetSchemaEditorContent = (
  props: PropertySetSchemaEditorContentProps,
) => {
  const { owner, name } = props;
  const { t } = useTranslation("admin");
  const { data } = usePageData<PropertySetSchema>(
    "propertySetSchema",
    "admin/property-sets/:owner/:name",
    { owner, name },
  );
  const schema = data as PropertySetSchema | null | undefined;
  const initial = schema?.properties
    ? JSON.stringify(schema.properties, null, 2)
    : "{}";
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setDraft(initial);
  }, [initial]);

  const hasChanges = draft !== initial;
  const hasJsonError = jsonError !== null;

  const handleSave = () => {
    if (hasJsonError || !hasChanges) return;
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(draft) as Record<string, unknown>;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
      return;
    }
    startTransition(async () => {
      setError(null);
      const result = await registerPropertySetSchema({
        ownerKey: owner,
        name,
        configurable: schema?.configurable ?? true,
        properties: parsed,
      });
      if (result.__typename === "StandardError") {
        setError(result.message);
      }
    });
  };

  return (
    <Card>
      <CardHeader className={styles.header}>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardBody>
        <div className={styles.inner}>
          <JsonTextArea
            value={draft}
            onChange={setDraft}
            onError={setJsonError}
            rows={8}
            aria-label={t("schema")}
            placeholder="{}"
          />
          {jsonError && <p className={styles.error}>{jsonError}</p>}
          {error && <p className={styles.error}>{error}</p>}
        </div>
      </CardBody>
      <CardFooter className={styles.actions}>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || hasJsonError || isPending}
          aria-label={t("save-schema")}
        >
          {isPending ? t("saving") : t("save-schema")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PropertySetSchemaEditorContent;
