import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge, Card, CardBody, CardHeader, CardTitle } from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import type { ListTextsQuery } from "~/generated/graphql";
import { CEFR_TO_KEY } from "~/utils/cefr";
import styles from "./recent.module.css";

type PagedTexts = ListTextsQuery["hadesQueries"]["texts"];

/**
 * Shows recently created texts.
 */
const Recent = () => {
  const { t } = useTranslation("library");
  const { data: texts } = usePageData<PagedTexts>("recentTexts", "recent", {});
  const { data: levelColours } = usePageData<Record<string, string> | null>(
    "levelColours",
    "levelColours",
  );

  const items = texts?.items ?? [];

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("recent")}</CardTitle>
        </CardHeader>
        <CardBody>
          <p className={styles.empty}>{t("no-recent")}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("recent")}</CardTitle>
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

export default Recent;
