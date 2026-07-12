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

type ReaderText = LocateTextQuery["hadesQueries"]["text"];

type TextDetailsContentProps = {
  /**
   * The text being read.
   */
  textId: string;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Loads and renders a single text as an annotatable markdown layer. Suspends
 * while the text fetches.
 */
const TextDetailsContent = ({ textId, className }: TextDetailsContentProps) => {
  const { t } = useTranslation("texts");
  const { data: text } = usePageData<ReaderText>("text", "texts/:id", {
    id: textId,
  });

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
        <CardDescription>
          {text.level} · {text.language}
        </CardDescription>
      </CardHeader>
      <CardBody>
        <AnnotationLayer
          textId={textId}
          content={text.content}
          className={className}
        />
      </CardBody>
    </Card>
  );
};

export default TextDetailsContent;
