import { useTranslation } from "react-i18next";
import { CardFooter, Button, cn } from "@sun/components";
import { BookOpenIcon } from "@heroicons/react/24/outline";
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
        <BookOpenIcon width={20} height={20} />
      </Button>
    </CardFooter>
  );
};

export default DefinitionToolbar;
