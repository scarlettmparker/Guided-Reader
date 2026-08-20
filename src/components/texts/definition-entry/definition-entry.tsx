import { Badge } from "@sun/components";
import type { WordEntry } from "~/generated/graphql";
import DefinitionTranslation from "../definition-translation";
import styles from "./definition-entry.module.css";

type DefinitionEntryProps = {
  /**
   * Word entry to render.
   */
  entry: WordEntry;
} & React.HTMLAttributes<HTMLLIElement>;

/**
 * Renders a single WordReference entry with its translations and examples.
 */
const DefinitionEntry = (props: DefinitionEntryProps) => {
  const { entry, ...rest } = props;

  return (
    <li className={styles.entry} {...rest}>
      <div className={styles.header}>
        <span className={styles.term}>{entry.term}</span>
        {entry.wordType && <Badge>{entry.wordType}</Badge>}
        {entry.sense && <span className={styles.sense}>{entry.sense}</span>}
      </div>
      <ul className={styles.translations}>
        {entry.translations.map((translation, index) => (
          <DefinitionTranslation key={index} translation={translation} />
        ))}
      </ul>
      {entry.examples.length > 0 && (
        <ul className={styles.examples}>
          {entry.examples.map((example, index) => (
            <li key={index} className={styles.example}>
              {example}
            </li>
          ))}
        </ul>
      )}
      {entry.note && <p className={styles.note}>{entry.note}</p>}
    </li>
  );
};

export default DefinitionEntry;
