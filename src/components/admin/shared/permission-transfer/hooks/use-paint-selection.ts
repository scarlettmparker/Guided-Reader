import { useEffect, useState } from "react";

/**
 * Paint selection via mouse drag.
 */
export function usePaintSelection() {
  const [drag, setDrag] = useState<{ active: boolean; target: boolean } | null>(
    null,
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const end = () => setDrag(null);
    window.addEventListener("mouseup", end);
    return () => window.removeEventListener("mouseup", end);
  }, []);

  /**
   * Handles mouse down on an item.
   */
  const onMouseDown = (value: string) => (_event: React.MouseEvent) => {
    const target = !selected.has(value);
    setDrag({ active: true, target });
    setSelected((prev) => {
      const next = new Set(prev);
      if (target) next.add(value);
      else next.delete(value);
      return next;
    });
  };

  /**
   * Handles mouse enter while dragging.
   */
  const onMouseEnter = (value: string) => () => {
    if (!drag?.active) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (drag.target) next.add(value);
      else next.delete(value);
      return next;
    });
  };

  return { selected, setSelected, drag, setDrag, onMouseDown, onMouseEnter };
}
