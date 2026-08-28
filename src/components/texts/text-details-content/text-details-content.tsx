import { useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { usePageData } from "@sun/ssr/react";
import { Button, Card, CardBody, CardFooter } from "@sun/components";
import { markViewed } from "~/server/actions/hades";
import AnnotationLayer from "~/components/texts/annotation-layer";
import DefinitionToolbar from "~/components/texts/definition-toolbar";
import DefinitionDialog from "~/components/texts/definition-dialog";
import NotesAuthorToggleDialog from "~/components/texts/notes-author-toggle-dialog";
import ShareNotesDialog from "~/components/texts/share-notes-dialog";
import TextVersions from "~/components/texts/text-versions";
import type { LocateTextQuery, PrivateNotesQuery, ViewedTextsQuery } from "~/generated/graphql";
import { useHiddenAuthors } from "./hooks/use-hidden-authors";
import TextHeader from "./text-header";

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
  const { data: privateNotes } = usePageData<
    PrivateNotesQuery["hadesQueries"]["privateNotes"]["items"]
  >("privateNotes", "privateNotes/:textId", { textId });
  const { data: viewedPage } = usePageData<
    ViewedTextsQuery["hadesQueries"]["viewedTexts"]
  >("viewedTexts", "library", {});
  const { hiddenAuthors, handleToggle } = useHiddenAuthors(textId);
  const [definitionOpen, setDefinitionOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [toggleOpen, setToggleOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isViewed = (viewedPage?.items ?? []).some((v) => v.textId === textId);

  useEffect(() => {
    if (textId) {
      void markViewed(textId);
    }
  }, [textId]);

  const handleMarkViewed = () => {
    startTransition(async () => {
      await markViewed(textId);
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
        <TextHeader
          text={text}
          privateNotesCount={privateNotes?.length ?? 0}
          onShare={() => setShareOpen(true)}
          onToggleAuthors={() => setToggleOpen(true)}
        />
        <CardBody>
          <AnnotationLayer
            textId={textId}
            content={text.content}
            privateNotes={visiblePrivateNotes}
            className={className}
          />
        </CardBody>
        <CardFooter>
          <Button
            variant={isViewed ? "secondary" : "default"}
            onClick={handleMarkViewed}
            disabled={isPending || isViewed}
            title={isViewed ? t("viewed") : t("mark-as-read")}
            aria-label={isViewed ? t("viewed") : t("mark-as-read")}
          >
            {isViewed ? t("viewed") : t("mark-as-read")}
          </Button>
        </CardFooter>
        <DefinitionToolbar onDefine={() => setDefinitionOpen(true)} />
      </Card>
      <TextVersions textId={textId} />
      <DefinitionDialog
        open={definitionOpen}
        onOpenChange={setDefinitionOpen}
      />
      <ShareNotesDialog
        textId={textId}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
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
