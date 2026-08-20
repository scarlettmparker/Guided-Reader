import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MarkdownViewer, ScrollArea } from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import {
  equalsExisting,
  getSelectionOffsets,
  overlapsExisting,
} from "~/utils/selection-to-offset";
import { unwrapCharacterRange, wrapCharacterRange } from "~/utils/wrap-range";
import { centeredDialogPosition } from "~/utils/dialog-position";
import type {
  ListAnnotationsQuery,
  PrivateNotesQuery,
  ReaderAccount,
} from "~/generated/graphql";
import AnnotationCreateDialog, {
  type AnnotationCreateState,
  type AnnotationSelection,
} from "../annotation-create-dialog";
import AnnotationListDialog, {
  type AnnotationListState,
} from "../annotation-list-dialog";
import PrivateNoteCreateDialog, {
  type PrivateNoteCreateState,
} from "../private-note-create-dialog";
import PrivateNoteListDialog, {
  type PrivateNoteListState,
} from "../private-note-list-dialog";
import SelectionTooltip from "../selection-tooltip";
import styles from "./annotation-layer.module.css";

type Annotation =
  ListAnnotationsQuery["hadesQueries"]["annotations"]["items"][number];

type PrivateNote =
  PrivateNotesQuery["hadesQueries"]["privateNotes"]["items"][number];

type AnnotationLayerProps = {
  /**
   * The text being read.
   */
  textId: string;
  /**
   * The markdown body to render and annotate.
   */
  content: string;
  /**
   * Private notes for the text, supplied by the parent loader to avoid double fetch.
   */
  privateNotes: PrivateNote[];
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Attribute used to tag injected highlight elements.
 */
const HIGHLIGHT_ATTR = "data-annotation-pos";
const PRIVATE_HIGHLIGHT_ATTR = "data-private-note-pos";

/**
 * Stable empty fallback so the annotations reference doesn't change between renders while loading.
 */
const NO_ANNOTATIONS: Annotation[] = [];

/**
 * Renders the text body as markdown, overlays highlights for existing annotations and
 * private notes, and drives the create/list dialogs from text selections.
 */
const AnnotationLayer = (props: AnnotationLayerProps) => {
  const { textId, content, privateNotes, className } = props;
  const { t } = useTranslation("texts");
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const setSearchParamsRef = useRef(setSearchParams);
  setSearchParamsRef.current = setSearchParams;

  const { data } = usePageData<Annotation[]>("annotations", "texts/:id", {
    id: textId,
  });
  const { data: currentUser } = usePageData<ReaderAccount | null>(
    "currentUser",
    "currentUser",
  );

  const annotations = data ?? NO_ANNOTATIONS;

  /**
   * Opens the annotation list for the ?annotation query param on initial load
   * or after a successful create.
   */
  useEffect(() => {
    const targetId = searchParams.get("annotation");
    if (!targetId || !annotations.length) {
      return;
    }
    const target =
      annotations.find((a) => a.id === targetId) ??
      annotations.find((a) => a.positionId === targetId);
    if (!target?.position) {
      return;
    }
    const raf = requestAnimationFrame(() => {
      const mark = containerRef.current?.querySelector<HTMLElement>(
        `[${HIGHLIGHT_ATTR}="${target.positionId}"]`,
      );
      const rect = mark?.getBoundingClientRect();
      const snippet =
        containerRef.current?.textContent?.slice(
          target.position?.startOffset,
          target.position?.endOffset,
        ) ?? "";
      const top = rect ? rect.bottom + 8 : 0;
      const left = rect ? rect.left + rect.width / 2 : 0;
      setList({
        open: true,
        position: centeredDialogPosition({ top, left }, 20),
        textId,
        positionId: target.positionId,
        snippet,
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [searchParams, annotations, textId]);

  /**
   * Opens the private note list for the ?note query param on initial load or
   * after a successful create.
   */
  useEffect(() => {
    const targetId = searchParams.get("note");
    if (!targetId || !privateNotes.length) {
      return;
    }
    const target = privateNotes.find((n) => n.id === targetId);
    if (!target) {
      return;
    }
    const raf = requestAnimationFrame(() => {
      const key = `${target.startOffset}-${target.endOffset}`;
      const mark = containerRef.current?.querySelector<HTMLElement>(
        `[${PRIVATE_HIGHLIGHT_ATTR}="${key}"]`,
      );
      const rect = mark?.getBoundingClientRect();
      const snippet =
        containerRef.current?.textContent?.slice(
          target.startOffset,
          target.endOffset,
        ) ?? "";
      const top = rect ? rect.bottom + 8 : 0;
      const left = rect ? rect.left + rect.width / 2 : 0;
      setPrivateList({
        open: true,
        position: centeredDialogPosition({ top, left }, 20),
        textId,
        startOffset: target.startOffset,
        endOffset: target.endOffset,
        snippet,
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [searchParams, privateNotes, textId]);

  /**
   * Unique positions and the annotations grouped under each.
   */
  const { positions, byPosition } = useMemo(() => {
    const posMap = new Map<
      string,
      { positionId: string; startOffset: number; endOffset: number }
    >();
    const groupMap = new Map<string, Annotation[]>();
    for (const annotation of annotations) {
      const { position } = annotation;
      if (!position) continue;
      if (!posMap.has(annotation.positionId)) {
        posMap.set(annotation.positionId, {
          positionId: annotation.positionId,
          startOffset: position.startOffset,
          endOffset: position.endOffset,
        });
      }
      const group = groupMap.get(annotation.positionId) ?? [];
      group.push(annotation);
      groupMap.set(annotation.positionId, group);
    }
    return { positions: [...posMap.values()], byPosition: groupMap };
  }, [annotations]);

  /**
   * Unique private note positions and the notes grouped under each.
   */
  const { privatePositions, byPrivatePosition } = useMemo(() => {
    const posMap = new Map<string, { startOffset: number; endOffset: number }>();
    const groupMap = new Map<string, PrivateNote[]>();
    for (const note of privateNotes) {
      const key = `${note.startOffset}-${note.endOffset}`;
      if (!posMap.has(key)) {
        posMap.set(key, {
          startOffset: note.startOffset,
          endOffset: note.endOffset,
        });
      }
      const group = groupMap.get(key) ?? [];
      group.push(note);
      groupMap.set(key, group);
    }
    return { privatePositions: [...posMap.values()], byPrivatePosition: groupMap };
  }, [privateNotes]);

  const [selection, setSelection] = useState<AnnotationSelection | null>(null);
  const [create, setCreate] = useState<AnnotationCreateState>({
    open: false,
    selection: null,
  });
  const [privateCreate, setPrivateCreate] = useState<PrivateNoteCreateState>({
    open: false,
    selection: null,
  });
  const [createFromList, setCreateFromList] = useState(false);
  const [privateCreateFromList, setPrivateCreateFromList] = useState(false);
  const [list, setList] = useState<AnnotationListState>({
    open: false,
    position: { top: 0, left: 0 },
    textId,
    positionId: "",
    snippet: "",
  });
  const [privateList, setPrivateList] = useState<PrivateNoteListState>({
    open: false,
    position: { top: 0, left: 0 },
    textId,
    startOffset: 0,
    endOffset: 0,
    snippet: "",
  });

  /**
   * Live annotations for the position being viewed, so the dialog updates after
   * a delete/vote without holding a stale snapshot.
   */
  const listAnnotations = list.open
    ? (byPosition.get(list.positionId) ?? NO_ANNOTATIONS)
    : NO_ANNOTATIONS;

  const privateNotesForPosition = privateList.open
    ? (byPrivatePosition.get(`${privateList.startOffset}-${privateList.endOffset}`) ?? [])
    : [];

  /**
   * Closes the list dialog when its position has no annotations left.
   */
  useEffect(() => {
    if (list.open && listAnnotations.length === 0) {
      setList((prev) => ({ ...prev, open: false }));
    }
  }, [list.open, listAnnotations]);

  /**
   * Closes the private note dialog when its position has no notes left.
   */
  useEffect(() => {
    if (privateList.open && privateNotesForPosition.length === 0) {
      setPrivateList((prev) => ({ ...prev, open: false }));
    }
  }, [privateList.open, privateNotesForPosition]);

  /**
   * Re-opens the create dialog anchored to the position's highlight, so a
   * reader can add their own annotation alongside existing ones.
   */
  const suggestOwnAnnotation = () => {
    const position = listAnnotations[0]?.position;
    if (!position) return;
    const mark = containerRef.current?.querySelector<HTMLElement>(
      `[${HIGHLIGHT_ATTR}="${list.positionId}"]`,
    );
    const rect = mark?.getBoundingClientRect();
    const snippet =
      containerRef.current?.textContent?.slice(
        position.startOffset,
        position.endOffset,
      ) ?? "";
    setList((prev) => ({ ...prev, open: false }));
    setCreateFromList(true);
    setCreate({
      open: true,
      selection: {
        top: rect ? rect.top + rect.height / 2 : list.position.top,
        bottom: rect ? rect.bottom : list.position.top,
        left: rect ? rect.left + rect.width / 2 : list.position.left,
        selectedText: snippet,
        startOffset: position.startOffset,
        endOffset: position.endOffset,
      },
    });
  };

  /**
   * Re-opens the private note create dialog at the position's highlight.
   */
  const suggestPrivateNote = () => {
    const snippet =
      containerRef.current?.textContent?.slice(
        privateList.startOffset,
        privateList.endOffset,
      ) ?? privateList.snippet;
    const key = `${privateList.startOffset}-${privateList.endOffset}`;
    const mark = containerRef.current?.querySelector<HTMLElement>(
      `[${PRIVATE_HIGHLIGHT_ATTR}="${key}"]`,
    );
    const rect = mark?.getBoundingClientRect();
    setPrivateList((prev) => ({ ...prev, open: false }));
    setPrivateCreateFromList(true);
    setPrivateCreate({
      open: true,
      selection: {
        top: rect ? rect.top + rect.height / 2 : privateList.position.top,
        bottom: rect ? rect.bottom : privateList.position.top,
        left: rect ? rect.left + rect.width / 2 : privateList.position.left,
        selectedText: snippet,
        startOffset: privateList.startOffset,
        endOffset: privateList.endOffset,
      },
    });
  };

  const handlePrivateOpenChange = (open: boolean) => {
    setPrivateList((prev) => ({ ...prev, open }));
    if (!open) {
      const next = new URLSearchParams(searchParams);
      next.delete("note");
      setSearchParams(next, { replace: true });
    }
  };

  /**
   * Returns from the private note create dialog to the note list it was opened from.
   */
  const handlePrivateCreateCancel = () => {
    setPrivateCreate((prev) => ({ ...prev, open: false }));
    setPrivateList((prev) => ({ ...prev, open: true }));
  };

  const handlePrivateCreated = (noteId: string) => {
    const next = new URLSearchParams(searchParams);
    if (noteId) {
      next.set("note", noteId);
    } else if (privateNotes.length) {
      const last = privateNotes[privateNotes.length - 1];
      if (last) next.set("note", last.id);
    }
    setSearchParams(next, { replace: true });
  };

  /**
   * Re-injects highlight elements for every annotation position whenever the
   * annotations or content change.
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    unwrapCharacterRange(container, HIGHLIGHT_ATTR);

    for (const { positionId, startOffset, endOffset } of positions) {
      const marks = wrapCharacterRange(
        container,
        startOffset,
        endOffset,
        () => {
          const mark = document.createElement("mark");
          mark.className = styles.highlight;
          mark.setAttribute(HIGHLIGHT_ATTR, positionId);
          mark.setAttribute("title", t("view-annotation"));
          return mark;
        },
      );
      for (const mark of marks) {
        mark.addEventListener("click", () => {
          const rect = mark.getBoundingClientRect();
          const snippet =
            containerRef.current?.textContent?.slice(startOffset, endOffset) ?? "";
          setList({
            open: true,
            position: centeredDialogPosition(
              { top: rect.bottom + 8, left: rect.left + rect.width / 2 },
              20,
            ),
            textId,
            positionId,
            snippet,
          });
          const next = new URLSearchParams(window.location.search);
          next.set("annotation", positionId);
          setSearchParamsRef.current(next, { replace: true });
        });
      }
    }
  }, [positions, byPosition, content, t, textId]);

  /**
   * Re-injects private note highlights.
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    unwrapCharacterRange(container, PRIVATE_HIGHLIGHT_ATTR);

    for (const { startOffset, endOffset } of privatePositions) {
      const key = `${startOffset}-${endOffset}`;
      const marks = wrapCharacterRange(
        container,
        startOffset,
        endOffset,
        () => {
          const mark = document.createElement("mark");
          mark.className = styles.private_highlight;
          mark.setAttribute(PRIVATE_HIGHLIGHT_ATTR, key);
          mark.setAttribute("title", t("view-note"));
          return mark;
        },
      );
      for (const mark of marks) {
        mark.addEventListener("click", () => {
          const rect = mark.getBoundingClientRect();
          const snippet =
            containerRef.current?.textContent?.slice(startOffset, endOffset) ?? "";
          setPrivateList({
            open: true,
            position: centeredDialogPosition(
              { top: rect.bottom + 8, left: rect.left + rect.width / 2 },
              20,
            ),
            textId,
            startOffset,
            endOffset,
            snippet,
          });
          const firstId = byPrivatePosition.get(key)?.[0]?.id;
          if (firstId) {
            const next = new URLSearchParams(window.location.search);
            next.set("note", firstId);
            setSearchParamsRef.current(next, { replace: true });
          }
        });
      }
    }
  }, [privatePositions, byPrivatePosition, content, t, textId]);

  /**
   * Clears the selection toolbar when the selection collapses or overlaps.
   */
  const clearSelection = () => {
    setSelection(null);
  };

  /**
   * Handles a mouse-up inside the text: shows the toolbar for valid ranges.
   */
  const handleMouseUp = () => {
    const container = containerRef.current;
    if (!container) return;
    const browserSelection = window.getSelection();
    if (!browserSelection || browserSelection.rangeCount === 0) {
      clearSelection();
      return;
    }
    const offsets = getSelectionOffsets(container);
    if (!offsets) {
      clearSelection();
      return;
    }
    const existingRanges = positions.map((p) => ({
      startOffset: p.startOffset,
      endOffset: p.endOffset,
    }));
    if (
      overlapsExisting(offsets.start, offsets.end, existingRanges) &&
      !equalsExisting(offsets.start, offsets.end, existingRanges)
    ) {
      clearSelection();
      return;
    }
    const rect = browserSelection.getRangeAt(0).getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      clearSelection();
      return;
    }
    setSelection({
      top: rect.top + rect.height / 2,
      bottom: rect.bottom,
      left: rect.left + rect.width / 2,
      selectedText: offsets.text,
      startOffset: offsets.start,
      endOffset: offsets.end,
    });
  };

  /**
   * Opens the create dialog at the selection and dismisses the toolbar.
   */
  const handleStartAnnotation = () => {
    if (!selection) return;
    setCreateFromList(false);
    setCreate({ open: true, selection });
    clearSelection();
  };

  /**
   * Opens the private note create dialog at the selection.
   */
  const handleStartPrivateNote = () => {
    if (!selection) return;
    setPrivateCreateFromList(false);
    setPrivateCreate({ open: true, selection });
    clearSelection();
  };

  const handleOpenDialog = (open: boolean) => {
    setList((prev) => ({ ...prev, open }));
    if (!open) {
      const next = new URLSearchParams(searchParams);
      next.delete("annotation");
      setSearchParams(next, { replace: true });
    }
  };

  /**
   * Returns from the create dialog to the annotation list it was opened from.
   */
  const handleCreateCancel = () => {
    setCreate((prev) => ({ ...prev, open: false }));
    setList((prev) => ({ ...prev, open: true }));
  };

  const handleCreated = (annotationId: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("annotation", annotationId);
    setSearchParams(next, { replace: true });
  };

  const viewer = useMemo(
    () => (
      <ScrollArea maxHeight="22rem">
        <MarkdownViewer>{content}</MarkdownViewer>
      </ScrollArea>
    ),
    [content],
  );

  return (
    <div ref={containerRef} className={className} onMouseUp={handleMouseUp}>
      {viewer}

      {selection && (
        <SelectionTooltip open top={selection.top} left={selection.left}>
          {currentUser ? (
            <>
              <span
                className={styles.action}
                onClick={(e) => {
                  e.preventDefault();
                  handleStartAnnotation();
                }}
              >
                {t("annotate")}
              </span>
              <span className={styles.divider} />
              <span
                className={styles.action}
                onClick={(e) => {
                  e.preventDefault();
                  handleStartPrivateNote();
                }}
              >
                {t("private-note")}
              </span>
            </>
          ) : (
            <Link className={styles.action} to="/login">
              {t("sign-in-to-annotate")}
            </Link>
          )}
        </SelectionTooltip>
      )}

      <AnnotationCreateDialog
        create={create}
        onOpenChange={(open) => setCreate((prev) => ({ ...prev, open }))}
        onCancel={createFromList ? handleCreateCancel : undefined}
        textId={textId}
        onCreated={handleCreated}
      />

      <PrivateNoteCreateDialog
        create={privateCreate}
        onOpenChange={(open) =>
          setPrivateCreate((prev: PrivateNoteCreateState) => ({ ...prev, open }))
        }
        onCancel={privateCreateFromList ? handlePrivateCreateCancel : undefined}
        textId={textId}
        onCreated={handlePrivateCreated}
      />

      {list.open && (
        <AnnotationListDialog
          key={list.positionId}
          list={list}
          annotations={listAnnotations}
          onOpenChange={handleOpenDialog}
          onSuggestAnnotation={suggestOwnAnnotation}
        />
      )}

      {privateList.open && (
        <PrivateNoteListDialog
          key={`${privateList.startOffset}-${privateList.endOffset}`}
          list={privateList}
          notes={privateNotesForPosition}
          onOpenChange={handlePrivateOpenChange}
          onSuggestNote={suggestPrivateNote}
        />
      )}
    </div>
  );
};

export default AnnotationLayer;
