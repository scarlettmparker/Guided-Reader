import { useTranslation } from "react-i18next";
import type { ReaderRole } from "~/generated/graphql";
import styles from "./reader-role-item.module.css";

type ReaderRoleItemProps = {
  /**
   * The learner level to display.
   */
  role: ReaderRole;
  /**
   * Optional colour swatch for the level.
   */
  colour?: string;
};

/**
 * A single learner-level row: a colour dot plus "CEFR (Level)".
 *
 * @param role the learner level
 * @param colour the level's colour, or undefined for none
 */
const ReaderRoleItem = ({ role, colour }: ReaderRoleItemProps) => {
  const { t } = useTranslation("nav");
  const levelLabel = t(`level.${role.key}`);
  const cefrLabel = role.cefrLevel
    ? t(`cefr.${role.cefrLevel.toLowerCase()}`)
    : null;

  return (
    <li
      className={styles.role}
      style={
        colour
          ? { color: `color-mix(in srgb, rgb(255, 255, 255), ${colour})` }
          : undefined
      }
    >
      {colour && (
        <span className={styles.role_dot} style={{ backgroundColor: colour }} />
      )}
      {cefrLabel ? `${cefrLabel} (${levelLabel})` : levelLabel}
    </li>
  );
};

export default ReaderRoleItem;
