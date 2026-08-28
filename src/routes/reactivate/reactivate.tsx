import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormField,
  FormFooter,
  FormItem,
  Input,
} from "@sun/components";
import {
  confirmAccountReactivation,
  requestAccountReactivation,
} from "~/server/actions/profile";
import styles from "./reactivate.module.css";

type ConfirmState = "idle" | "success" | "error";

/**
 * Public page for reactivating a deactivated account, either via an emailed
 * token link or by requesting a fresh link.
 */
const Reactivate = () => {
  const { t } = useTranslation("reactivate");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>("idle");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    setPending(true);
    confirmAccountReactivation(token).then((result) => {
      if (!active) return;
      setPending(false);
      setConfirm(result.__typename === "QuerySuccess" ? "success" : "error");
    });
    return () => {
      active = false;
    };
  }, [token]);

  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    setPending(true);
    setError(false);
    requestAccountReactivation(email.trim()).then((result) => {
      setPending(false);
      if (result.__typename === "QuerySuccess") {
        setSent(true);
      } else {
        setError(true);
      }
    });
  };

  return (
    <div className={styles.wrapper}>
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardBody>
          {token ? (
            <div className={styles.status_group}>
              <p className={styles.status}>
                {confirm === "success" && t("confirmed")}
                {confirm === "error" && t("confirm-error")}
                {confirm === "idle" && t("confirming")}
              </p>
              {(confirm === "error" || confirm === "success") && (
                <Link className={styles.back_link} to="/login">
                  <Button type="button" variant="secondary">
                    {t("back-to-login")}
                  </Button>
                </Link>
              )}
            </div>
          ) : sent ? (
            <div className={styles.status_group}>
              <p className={styles.status}>{t("sent")}</p>
              <Link className={styles.back_link} to="/login">
                <Button type="button" variant="secondary">
                  {t("back-to-login")}
                </Button>
              </Link>
            </div>
          ) : (
            <Form onSubmit={handleSend}>
              <FormField name="email">
                <FormItem>
                  <Input
                    type="email"
                    placeholder={t("email-placeholder")}
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    required
                    autoFocus
                  />
                </FormItem>
              </FormField>
              {error && (
                <div className={styles.status_group}>
                  <p className={styles.error}>{t("send-error")}</p>
                  <Link className={styles.back_link} to="/login">
                    <Button type="button" variant="secondary">
                      {t("back-to-login")}
                    </Button>
                  </Link>
                </div>
              )}
              <FormFooter className={styles.form_footer}>
                <Link to="/login">
                  <Button type="button" variant="secondary">
                    {t("back-to-login")}
                  </Button>
                </Link>
                <Button type="submit" disabled={pending || !email.trim()}>
                  {t("send-link")}
                </Button>
              </FormFooter>
            </Form>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Reactivate;
