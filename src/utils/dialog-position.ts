const REM_PX =
  typeof document !== "undefined"
    ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    : 16;

/**
 * Computes a draggable dialog's top-left so it is horizontally centred on the
 * given point and kept within the viewport.
 *
 * @param center the viewport point to centre the dialog on
 * @param widthRem the dialog's CSS width in rem
 * @returns the clamped top-left position
 */
export function centeredDialogPosition(
  center: { top: number; left: number },
  widthRem: number,
): { top: number; left: number } {
  const width = widthRem * REM_PX;
  const margin = 8;
  return {
    top: Math.max(margin, Math.min(center.top, window.innerHeight - margin)),
    left: Math.max(
      margin,
      Math.min(center.left - width / 2, window.innerWidth - width - margin),
    ),
  };
}
