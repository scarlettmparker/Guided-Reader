import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge, Card, CardBody, CardHeader, CardTitle } from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import type { ListTextsQuery } from "~/generated/graphql";
import { CEFR_TO_KEY } from "~/utils/cefr";
import styles from "./by-level.module.css";

type PagedTexts = ListTextsQuery["hadesQueries"]["texts"];

/**
 * Groups texts by CEFR level.
 */
const ByLevel = () => {
  const { t } = useTranslation("library");
  const { data: texts } = usePageData<PagedTexts>("texts", "texts", {
    page: "0",
  });
  const { data: levelColours } = usePageData<Record<string, string> | null>(
    "levelColours",
    "levelColours",
  );

  const items = texts?.items ?? [];

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("by-level")}</CardTitle>
        </CardHeader>
        <CardBody>
          <p className={styles.empty}>{t("no-texts")}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("by-level")}</CardTitle>
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

export default ByLevel;
