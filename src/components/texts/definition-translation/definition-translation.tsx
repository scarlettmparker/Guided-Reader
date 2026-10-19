import type { WordTranslation } from "~/generated/graphql";
import styles from "./definition-translation.module.css";

type DefinitionTranslationProps = {
  /**
   * Translation to render.
   */
  translation: WordTranslation;
} & React.HTMLAttributes<HTMLLIElement>;

/**
 * Renders a single translation with its notes.
 */
const DefinitionTranslation = (props: DefinitionTranslationProps) => {
  const { translation, ...rest } = props;

  return (
    <li className={styles.translation} {...rest}>
      <span className={styles.term}>{translation.term}</span>
      {translation.wordType && <span className={styles.word_type}>{translation.wordType}</span>}
      {translation.usageNotes.length > 0 && (
        <span className={styles.usage}>({translation.usageNotes.join(", ")})</span>
      )}
    </li>
  );
};

export default DefinitionTranslation;
