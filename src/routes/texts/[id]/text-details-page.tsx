import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePageData } from "@sun/ssr/react";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sun/components";
import AnnotationLayer from "~/components/texts/annotation-layer";
import type { LocateTextQuery } from "~/generated/graphql";
import styles from "./text-details-page.module.css";

type ReaderText = LocateTextQuery["hadesQueries"]["text"];

/**
 * Text detail page: renders a single text as an annotatable markdown layer.
 */
const TextDetailsPage = () => {
  const { t } = useTranslation("texts");
  const { id } = useParams<{ id: string }>();
  const { data: text } = usePageData<ReaderText>("text", "texts/:id", {
    id: id!,
  });

  if (!text || !id) {
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
        <CardDescription>
          {text.level} · {text.language}
        </CardDescription>
      </CardHeader>
      <CardBody>
        <AnnotationLayer
          textId={id}
          content={text.content}
          className={styles.content}
        />
      </CardBody>
    </Card>
  );
};

export default TextDetailsPage;
