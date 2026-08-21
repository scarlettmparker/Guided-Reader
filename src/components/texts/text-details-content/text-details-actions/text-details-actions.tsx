import { useState } from "react";
import DefinitionDialog from "~/components/texts/definition-dialog";
import DefinitionToolbar from "~/components/texts/definition-toolbar";
import NotesAuthorToggleDialog from "~/components/texts/notes-author-toggle-dialog";
import ShareNotesDialog from "~/components/texts/share-notes-dialog";

type TextDetailsActionsProps = {
  /**
   * Text id for dialogs that need it.
   */
  textId: string;
  /**
   * Currently hidden author ids.
   */
  hiddenAuthors: Set<string>;
  /**
   * Called when an author toggle changes.
   */
  onToggle: (authorId: string, checked: boolean) => void;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Owns the definition/share/author-toggle dialogs and toolbar.
 */
const TextDetailsActions = (props: TextDetailsActionsProps) => {
  const { textId, hiddenAuthors, onToggle } = props;
  const [definitionOpen, setDefinitionOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [toggleOpen, setToggleOpen] = useState(false);

  return (
    <>
      <DefinitionToolbar onDefine={() => setDefinitionOpen(true)} />
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
        onToggle={onToggle}
      />
    </>
  );
};

export default TextDetailsActions;
