import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageData } from "@sun/ssr/react";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@sun/components";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import AnnotationLayer from "~/components/texts/annotation-layer";
import DefinitionToolbar from "~/components/texts/definition-toolbar";
import DefinitionDialog from "~/components/texts/definition-dialog";
import type { LocateTextQuery, PrivateNotesQuery } from "~/generated/graphql";
import styles from "./text-details-content.module.css";

type ReaderText = LocateTextQuery["hadesQueries"]["text"];

type TextDetailsContentProps = {
  /**
   * The text being read.
   */
  textId: string;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Loads and renders a single text as an annotatable markdown layer. Suspends
 * while the text fetches.
 */
const TextDetailsContent = (props: TextDetailsContentProps) => {
  const { textId, className } = props;
  const { t } = useTranslation("texts");
  const { data: text } = usePageData<ReaderText>("text", "texts/:id", {
    id: textId,
  });
  const [definitionOpen, setDefinitionOpen] = useState(false);
  const { data: privateNotes } = usePageData<
    PrivateNotesQuery["hadesQueries"]["privateNotes"]["items"]
  >("privateNotes", "privateNotes/:textId", { textId });
  const privateNotesCount = privateNotes?.length ?? 0;

  if (!text) {
    return (
      <Card>
        <CardBody>
          <p>{t("not-found")}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            {text.title}
            {privateNotesCount > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={styles.count_icon}>
                    <DocumentTextIcon width={20} height={20} />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {privateNotesCount}{" "}
                  {privateNotesCount === 1 ? "note" : "notes"}
                </TooltipContent>
              </Tooltip>
            )}
          </CardTitle>
          <CardDescription>
            {text.level} · {text.language}
          </CardDescription>
        </CardHeader>
        <CardBody>
          <AnnotationLayer
            textId={textId}
            content={text.content}
            privateNotes={privateNotes ?? []}
            className={className}
          />
        </CardBody>
        <DefinitionToolbar onDefine={() => setDefinitionOpen(true)} />
      </Card>
      <DefinitionDialog
        open={definitionOpen}
        onOpenChange={setDefinitionOpen}
      />
    </>
  );
};

export default TextDetailsContent;
