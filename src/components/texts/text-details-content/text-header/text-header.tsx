import { useTranslation } from "react-i18next";
import {
  CardDescription,
  CardHeader,
  CardTitle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from "@sun/components";
import { DocumentTextIcon, ShareIcon } from "@heroicons/react/24/outline";
import type { LocateTextQuery } from "~/generated/graphql";
import styles from "./text-header.module.css";

type ReaderText = LocateTextQuery["hadesQueries"]["text"];

type TextHeaderProps = {
  /**
   * Text to display.
   */
  text: NonNullable<ReaderText>;
  /**
   * Number of private notes on this text.
   */
  privateNotesCount: number;
  /**
   * Called when share is requested.
   */
  onShare: () => void;
  /**
   * Called when notes author toggle is requested.
   */
  onToggleAuthors: () => void;
} & React.HTMLAttributes<HTMLElement>;

/**
 * Header for the text details card with title, meta and action icons.
 */
const TextHeader = (props: TextHeaderProps) => {
  const {
    text,
    privateNotesCount,
    onShare,
    onToggleAuthors,
    className,
    ...rest
  } = props;
  const { title, level, language } = text;
  const { t } = useTranslation("texts");

  return (
    <CardHeader className={cn(styles.header, className)} {...rest}>
      <CardTitle className={styles.title}>
        {title}
        <span className={styles.title_actions}>
          {privateNotesCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  className={styles.icon_link}
                  href="#"
                  title={t("notes-authors-title")}
                  aria-label={t("notes-authors-title")}
                  onClick={(event) => {
                    event.preventDefault();
                    onToggleAuthors();
                  }}
                >
                  <DocumentTextIcon width={20} height={20} />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                {privateNotesCount} {privateNotesCount === 1 ? "note" : "notes"}
              </TooltipContent>
            </Tooltip>
          )}
          <a
            className={styles.icon_link}
            href="#"
            title={t("share-notes-title")}
            aria-label={t("share-notes-title")}
            onClick={(event) => {
              event.preventDefault();
              onShare();
            }}
          >
            <ShareIcon width={20} height={20} />
          </a>
        </span>
      </CardTitle>
      <CardDescription>
        {level} · {language}
      </CardDescription>
    </CardHeader>
  );
};

export default TextHeader;
