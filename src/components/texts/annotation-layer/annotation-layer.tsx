import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MarkdownViewer } from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import {
  getSelectionOffsets,
  overlapsExisting,
} from "~/utils/selection-to-offset";
import { unwrapCharacterRange, wrapCharacterRange } from "~/utils/wrap-range";
import { centeredDialogPosition } from "~/utils/dialog-position";
import type { ListAnnotationsQuery, ReaderAccount } from "~/generated/graphql";
import AnnotationCreateDialog, {
  type AnnotationCreateState,
  type AnnotationSelection,
} from "../annotation-create-dialog";
import AnnotationListDialog, {
  type AnnotationListState,
} from "../annotation-list-dialog";
import SelectionTooltip from "../selection-tooltip";
import styles from "./annotation-layer.module.css";

type Annotation = ListAnnotationsQuery["hadesQueries"]["annotations"][number];

type AnnotationLayerProps = {
  /**
   * The text being read.
   */
  textId: string;
  /**
   * The markdown body to render and annotate.
   */
  content: string;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Attribute used to tag injected highlight elements.
 */
const HIGHLIGHT_ATTR = "data-annotation-pos";

/**
 * Stable empty fallback so the annotations reference doesn't change between
 * renders while loading.
 */
const NO_ANNOTATIONS: Annotation[] = [];

/**
 * Renders the text body as markdown, overlays highlights for existing
 * annotations, and drives the create/list dialogs from text selections.
 */
const AnnotationLayer = ({
  textId,
  content,
  className,
}: AnnotationLayerProps) => {
  const { t } = useTranslation("texts");
  const containerRef = useRef<HTMLDivElement>(null);

  const { data } = usePageData<Annotation[]>("annotations", "texts/:id", {
    id: textId,
  });
  const { data: currentUser } = usePageData<ReaderAccount | null>(
    "currentUser",
    "currentUser",
  );

  const annotations = data ?? NO_ANNOTATIONS;

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

  const [selection, setSelection] = useState<AnnotationSelection | null>(null);
  const [create, setCreate] = useState<AnnotationCreateState>({
    open: false,
    selection: null,
  });
  const [list, setList] = useState<AnnotationListState>({
    open: false,
    position: { top: 0, left: 0 },
    textId,
    positionId: "",
  });

  /**
   * Live annotations for the position being viewed, so the dialog updates after
   * a delete/vote without holding a stale snapshot.
   */
  const listAnnotations = list.open
    ? (byPosition.get(list.positionId) ?? NO_ANNOTATIONS)
    : NO_ANNOTATIONS;

  /**
   * Closes the list dialog when its position has no annotations left.
   */
  useEffect(() => {
    if (list.open && listAnnotations.length === 0) {
      setList((prev) => ({ ...prev, open: false }));
    }
  }, [list.open, listAnnotations]);

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
          return mark;
        },
      );
      for (const mark of marks) {
        mark.addEventListener("click", () => {
          const rect = mark.getBoundingClientRect();
          setList({
            open: true,
            position: centeredDialogPosition(
              { top: rect.bottom + 16, left: rect.left + rect.width / 2 },
              20,
            ),
            textId,
            positionId,
          });
        });
      }
    }
  }, [positions, byPosition, content]);

  /**
   * Clears the selection toolbar when the selection collapses or overlaps.
   */
  const clearSelection = () => setSelection(null);

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
    if (
      overlapsExisting(
        offsets.start,
        offsets.end,
        positions.map((p) => ({
          startOffset: p.startOffset,
          endOffset: p.endOffset,
        })),
      )
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
    setCreate({ open: true, selection });
    clearSelection();
  };

  const viewer = useMemo(
    () => <MarkdownViewer>{content}</MarkdownViewer>,
    [content],
  );

  return (
    <div ref={containerRef} className={className} onMouseUp={handleMouseUp}>
      {viewer}

      {selection && (
        <SelectionTooltip open top={selection.top} left={selection.left}>
          {currentUser ? (
            <span
              className={styles.action}
              onClick={(e) => {
                e.preventDefault();
                handleStartAnnotation();
              }}
            >
              {t("annotate")}
            </span>
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
        textId={textId}
      />

      <AnnotationListDialog
        list={list}
        annotations={listAnnotations}
        onOpenChange={(open) => setList((prev) => ({ ...prev, open }))}
      />
    </div>
  );
};

export default AnnotationLayer;
