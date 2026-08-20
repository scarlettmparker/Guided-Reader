import { useTranslation } from "react-i18next";
import { usePageData } from "@sun/ssr/react";
import type { Word } from "~/generated/graphql";
import DefinitionEntry from "../definition-entry";
import styles from "./definition-content.module.css";

type DefinitionContentProps = {
  /**
   * Headword to define.
   */
  word: string;
};

/**
 * Loads and renders the definition entries for a word.
 */
const DefinitionContent = (props: DefinitionContentProps) => {
  const { word } = props;
  const { t } = useTranslation("texts");
  const { data } = usePageData<Word>("word", "defineWord/:word", { word });

  if (!data.entries.length) {
    return <p className={styles.empty}>{t("definition.no-result")}</p>;
  }

  return (
    <ul className={styles.entries}>
      {data.entries.map((entry) => (
        <li key={entry.id} className={styles.entry}>
          <DefinitionEntry entry={entry} />
        </li>
      ))}
    </ul>
  );
};

export default DefinitionContent;
