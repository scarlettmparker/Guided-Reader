import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
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
  const emailParam = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(emailParam);
  const [sent, setSent] = useState(false);
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
    requestAccountReactivation(email.trim()).then(() => {
      setPending(false);
      setSent(true);
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
            <p className={styles.status}>
              {confirm === "success" && t("confirmed")}
              {confirm === "error" && t("confirm-error")}
              {confirm === "idle" && t("confirming")}
            </p>
          ) : sent ? (
            <p className={styles.status}>{t("sent")}</p>
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
              <FormFooter className={styles.form_footer}>
                <Button type="submit" disabled={pending || !email.trim()}>
                  {t("send-link")}
                </Button>
              </FormFooter>
            </Form>
          )}
        </CardBody>
        <CardFooter className={styles.footer}>
          <Link to="/login">
            <Button variant="secondary">{t("back-to-login")}</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Reactivate;
