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

  const viewedOrder = new Map(
    (viewed?.items ?? []).map((v, i) => [v.textId, i]),
  );
  const items = (texts?.items ?? [])
    .filter((item) => viewedOrder.has(item.id))
    .sort((a, b) => (viewedOrder.get(a.id) ?? 0) - (viewedOrder.get(b.id) ?? 0))
    .slice(0, 10);

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
        <ul className={styles.list}>
          {items.map((item) => {
            const colour = levelColours?.[CEFR_TO_KEY[item.level]];
            return (
              <li key={item.id}>
                <Link to={`/texts/${item.id}`} className={styles.item}>
                  <Badge
                    className={styles.item_level}
                    style={colour ? { backgroundColor: colour } : undefined}
                  >
                    {item.level}
                  </Badge>
                  <span className={styles.item_title}>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardBody>
    </Card>
  );
};

export default ContinueReading;
