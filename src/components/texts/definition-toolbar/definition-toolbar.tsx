import { useTranslation } from "@sun/i18n";
import { CardFooter, Button, cn } from "@sun/components";
import { BookOpenOutline } from "preact-heroicons";
import styles from "./definition-toolbar.module.css";

type DefinitionToolbarProps = {
  /**
   * Called to open the definition dialog.
   */
  onDefine: () => void;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Always-visible bottom bar with and action buttons.
 */
const DefinitionToolbar = (props: DefinitionToolbarProps) => {
  const { onDefine, className, ...rest } = props;
  const { t } = useTranslation("texts");

  return (
    <CardFooter className={cn(styles.toolbar, className)} {...rest}>
      <Button
        onClick={onDefine}
        variant="secondary"
        title={t("definition.open-title")}
        aria-label={t("definition.open-title")}
      >
        <BookOpenOutline width={20} height={20} />
      </Button>
    </CardFooter>
  );
};

export default DefinitionToolbar;
