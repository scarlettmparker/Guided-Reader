import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePageData } from "@sun/ssr/react";
import { Card, CardBody, CardDescription, CardHeader, CardTitle, MarkdownViewer } from "@sun/components";
import type { LocateTextQuery } from "~/generated/graphql";
import styles from "./text-details-page.module.css";

type ReaderText = LocateTextQuery["hadesQueries"]["text"];

/**
 * Text detail page: renders a single text as markdown.
 */
const TextDetailsPage = () => {
  const { t } = useTranslation("texts");
  const { id } = useParams<{ id: string }>();
  const { data: text } = usePageData<ReaderText>(
    "text",
    "texts/:id",
    { id: id! },
  );

  if (!text) {
    return (
      <Card>
        <CardBody>
          <p>{t("not-found")}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text.title}</CardTitle>
        <CardDescription>{text.level} · {text.language}</CardDescription>
      </CardHeader>
      <CardBody>
        <MarkdownViewer className={styles.content}>
          {text.content}
        </MarkdownViewer>
      </CardBody>
    </Card>
  );
};

export default TextDetailsPage;
