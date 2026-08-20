import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageData } from "@sun/ssr/react";
import {
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@sun/components";
import { DocumentTextIcon, ShareIcon } from "@heroicons/react/24/outline";
import AnnotationLayer from "~/components/texts/annotation-layer";
import DefinitionToolbar from "~/components/texts/definition-toolbar";
import DefinitionDialog from "~/components/texts/definition-dialog";
import NotesAuthorToggleDialog from "~/components/texts/notes-author-toggle-dialog";
import ShareNotesDialog from "~/components/texts/share-notes-dialog";
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
  const [shareOpen, setShareOpen] = useState(false);
  const [toggleOpen, setToggleOpen] = useState(false);
  const [hiddenAuthors, setHiddenAuthors] = useState<Set<string>>(new Set());
  const { data: privateNotes } = usePageData<
    PrivateNotesQuery["hadesQueries"]["privateNotes"]["items"]
  >("privateNotes", "privateNotes/:textId", { textId });
  const privateNotesCount = privateNotes?.length ?? 0;

  useEffect(() => {
    const raw = localStorage.getItem(`guided-reader:notes-hidden:${textId}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as string[];
        setHiddenAuthors(new Set(parsed));
      } catch {
        setHiddenAuthors(new Set());
      }
    } else {
      setHiddenAuthors(new Set());
    }
  }, [textId]);

  useEffect(() => {
    localStorage.setItem(`guided-reader:notes-hidden:${textId}`, JSON.stringify(Array.from(hiddenAuthors)));
  }, [textId, hiddenAuthors]);

  const handleToggle = (authorId: string, checked: boolean) => {
    setHiddenAuthors((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.delete(authorId);
      } else {
        next.add(authorId);
      }
      return next;
    });
  };

  const visiblePrivateNotes = (privateNotes ?? []).filter((note) => {
    const authorId = note.authorProfile?.id ?? note.author?.id ?? "";
    return !hiddenAuthors.has(authorId);
  });

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
                  <Button
                    variant="secondary"
                    className={styles.count_icon}
                    title={t("notes-authors-title")}
                    aria-label={t("notes-authors-title")}
                    onClick={() => setToggleOpen(true)}
                  >
                    <DocumentTextIcon width={20} height={20} />
                    <span>{privateNotesCount}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {privateNotesCount} {privateNotesCount === 1 ? "note" : "notes"}
                </TooltipContent>
              </Tooltip>
            )}
            <Button
              variant="secondary"
              className={styles.share_button}
              title={t("share-notes-title")}
              aria-label={t("share-notes-title")}
              onClick={() => setShareOpen(true)}
            >
              <ShareIcon width={20} height={20} />
            </Button>
          </CardTitle>
          <CardDescription>
            {text.level} · {text.language}
          </CardDescription>
        </CardHeader>
        <CardBody>
          <AnnotationLayer
            textId={textId}
            content={text.content}
            privateNotes={visiblePrivateNotes}
            className={className}
          />
        </CardBody>
        <DefinitionToolbar onDefine={() => setDefinitionOpen(true)} />
      </Card>
      <DefinitionDialog open={definitionOpen} onOpenChange={setDefinitionOpen} />
      <ShareNotesDialog textId={textId} open={shareOpen} onOpenChange={setShareOpen} />
      <NotesAuthorToggleDialog
        textId={textId}
        open={toggleOpen}
        onOpenChange={setToggleOpen}
        hiddenAuthors={hiddenAuthors}
        onToggle={handleToggle}
      />
    </>
  );
};

export default TextDetailsContent;
