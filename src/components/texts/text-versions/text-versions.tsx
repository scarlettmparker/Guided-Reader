import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  MarkdownViewer,
} from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import type { TextVersionsQuery } from "~/generated/graphql";
import styles from "./text-versions.module.css";

type VersionsData = TextVersionsQuery["hadesQueries"]["textVersions"];

type TextVersionsProps = {
  /**
   * The text id to load versions for.
   */
  textId: string;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Shows version history for a text.
 */
const TextVersions = (props: TextVersionsProps) => {
  const { textId, className, ...rest } = props;
  const { t } = useTranslation("library");
  const { data: versions } = usePageData<VersionsData>("versions", "texts/:id/versions", {
    id: textId,
  });

  if (!versions || versions.length === 0) {
    return (
      <Card className={className} {...rest}>
        <CardHeader>
          <CardTitle>{t("versions")}</CardTitle>
        </CardHeader>
        <CardBody>
          <p className={styles.empty}>{t("no-versions")}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={className} {...rest}>
      <CardHeader>
        <CardTitle>{t("versions")}</CardTitle>
      </CardHeader>
      <CardBody>
        <div className={styles.table_wrap}>
          {versions.map((v) => (
            <Accordion key={v.id}>
              <AccordionTrigger>
                {t("version-label", { version: v.version })} — {v.title} — {v.level} —{" "}
                {v.createdAt ?? ""}
              </AccordionTrigger>
              <AccordionContent>
                <div className={styles.content_preview}>
                  <MarkdownViewer content={v.content} />
                </div>
              </AccordionContent>
            </Accordion>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default TextVersions;
