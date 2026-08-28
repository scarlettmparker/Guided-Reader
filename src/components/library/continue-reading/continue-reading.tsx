import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge, Card, CardBody, CardHeader, CardTitle } from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import type { ViewedTextsQuery, ListTextsQuery } from "~/generated/graphql";
import { CEFR_TO_KEY } from "~/utils/cefr";
import styles from "./continue-reading.module.css";

type ViewedData = ViewedTextsQuery["hadesQueries"]["viewedTexts"];
type PagedTexts = ListTextsQuery["hadesQueries"]["texts"];

/**
 * Shows texts the user has viewed.
 */
const ContinueReading = () => {
  const { t } = useTranslation("library");
  const { data: viewed } = usePageData<ViewedData>("viewedTexts", "library", {});
  const { data: texts } = usePageData<PagedTexts>("texts", "texts", {
    page: "0",
  });
  const { data: levelColours } = usePageData<Record<string, string> | null>(
    "levelColours",
    "levelColours",
  );

  const viewedIds = new Set((viewed?.items ?? []).map((v) => v.textId));
  const items = (texts?.items ?? []).filter((item) => viewedIds.has(item.id));

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("continue-reading")}</CardTitle>
        </CardHeader>
        <CardBody>
          <p className={styles.empty}>{t("no-viewed")}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("continue-reading")}</CardTitle>
      </CardHeader>
      <CardBody>
        <div className={styles.grid}>
          {items.map((item) => {
            const colour = levelColours?.[CEFR_TO_KEY[item.level]];
            return (
              <Link
                key={item.id}
                to={`/texts/${item.id}`}
                className={styles.card_link}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <Badge style={colour ? { backgroundColor: colour } : undefined}>
                      {item.level}
                    </Badge>
                    <Badge variant="secondary">{t("viewed")}</Badge>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};

export default ContinueReading;
