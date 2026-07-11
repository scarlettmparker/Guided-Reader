import { createPortal } from "react-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@sun/components";
import styles from "./selection-tooltip.module.css";

type SelectionTooltipProps = {
  /**
   * Whether the tooltip is shown.
   */
  open: boolean;
  /**
   * Viewport Y of the selection's upper edge.
   */
  top: number;
  /**
   * Viewport X of the selection's horizontal centre.
   */
  left: number;
} & React.PropsWithChildren;

/**
 * Tooltip anchored above a text selection.
 */
const SelectionTooltip = ({
  open,
  top,
  left,
  children,
}: SelectionTooltipProps) => {
  if (typeof document === "undefined") return null;

  /**
   * Stops mouse events bubbling through the portal's React tree to the text
   * container, whose mouseup handler would otherwise clear the selection
   * before the annotate click can fire.
   */
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return createPortal(
    <Tooltip open={open}>
      <TooltipTrigger asChild>
        <div
          className={styles.anchor}
          style={{ top: `${top}px`, left: `${left}px` }}
        />
      </TooltipTrigger>
      <TooltipContent side="top" onMouseUp={stop} onMouseDown={stop}>
        {children}
      </TooltipContent>
    </Tooltip>,
    document.body,
  );
};

export default SelectionTooltip;
