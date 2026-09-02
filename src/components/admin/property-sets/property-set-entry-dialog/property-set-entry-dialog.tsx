import { useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  JsonTextArea,
} from "@sun/components";
import { upsertPropertyEntry } from "~/server/actions/propertySets";
import type { PropertySetEntry } from "~/generated/graphql";
import styles from "./property-set-entry-dialog.module.css";

type PropertySetEntryDialogProps = {
  /**
   * Owner key of the property set.
   */
  owner: string;
  /**
   * Name of the property set.
   */
  name: string;
  /**
   * Entry to edit.
   */
  entry: PropertySetEntry | null;
  /**
   * Whether the dialog is open.
   */
  open: boolean;
  /**
   * Called when open state changes.
   */
  onOpenChange: (open: boolean) => void;
};

/**
 * Dialog for editing a property-set entry's values.
 */
const PropertySetEntryDialog = (props: PropertySetEntryDialogProps) => {
  const { owner, name, entry, open, onOpenChange } = props;
  const { t } = useTranslation("admin");
  const initial = entry ? JSON.stringify(entry.values, null, 2) : "{}";
  const [draft, setDraft] = useState(initial);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setDraft(initial);
    setJsonError(null);
    setError(null);
  }, [initial, open]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (jsonError || !entry) return;
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(draft) as Record<string, unknown>;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
      return;
    }
    startTransition(async () => {
      setError(null);
      const result = await upsertPropertyEntry(owner, name, entry.entryName, parsed);
      if (result.__typename === "StandardError") {
        setError(result.message);
        return;
      }
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className={styles.dialog}>
      <DialogHeader>
        <DialogTitle>{t("edit-entry")}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Form id="edit-entry-form" onSubmit={handleSubmit}>
          <JsonTextArea
            value={draft}
            onChange={setDraft}
            onError={setJsonError}
            rows={8}
            aria-label={t("values")}
            placeholder="{}"
          />
        </Form>
        {jsonError && <p className={styles.error}>{jsonError}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </DialogBody>
      <DialogFooter>
        <Button
          type="button"
          variant="secondary"
          onClick={() => onOpenChange(false)}
          title={t("cancel-label")}
          aria-label={t("cancel-label")}
        >
          {t("cancel-label")}
        </Button>
        <Button
          type="submit"
          form="edit-entry-form"
          disabled={isPending || jsonError !== null}
          title={t("save-entry")}
          aria-label={t("save-entry")}
        >
          {isPending ? t("saving") : t("save-entry")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default PropertySetEntryDialog;
