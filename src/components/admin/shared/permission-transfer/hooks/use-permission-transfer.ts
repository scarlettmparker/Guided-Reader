import { useMemo } from "react";
import { usePaintSelection } from "./use-paint-selection";

/**
 * Transfer state for string items.
 *
 * @param catalog - Full catalogue.
 * @param assignedPermissions - Assigned items.
 * @param onChange - Called with next assigned list.
 */
export function usePermissionTransfer(
  catalog: string[],
  assignedPermissions: string[],
  onChange: (next: string[]) => void,
) {
  const left = usePaintSelection();
  const right = usePaintSelection();

  const assigned = useMemo(
    () => [...assignedPermissions].sort((a, b) => a.localeCompare(b)),
    [assignedPermissions],
  );

  const available = useMemo(() => {
    return catalog.filter((p) => !assigned.includes(p)).sort((a, b) => a.localeCompare(b));
  }, [assigned, catalog]);

  /**
   * Moves selected available to assigned.
   */
  const moveSelectedToAssigned = () => {
    if (left.selected.size === 0) return;
    const toMove = [...left.selected].filter((v) => available.includes(v));
    onChange([...new Set([...assigned, ...toMove])].sort((a, b) => a.localeCompare(b)));
    left.setSelected(new Set());
  };

  /**
   * Moves selected assigned to available.
   */
  const moveSelectedToAvailable = () => {
    if (right.selected.size === 0) return;
    onChange(assigned.filter((v) => !right.selected.has(v)));
    right.setSelected(new Set());
  };

  /**
   * Moves all available to assigned.
   */
  const moveAllToAssigned = () => {
    if (available.length === 0) return;
    onChange([...new Set([...assigned, ...available])].sort((a, b) => a.localeCompare(b)));
    left.setSelected(new Set());
  };

  /**
   * Moves all assigned to available.
   */
  const moveAllToAvailable = () => {
    if (assigned.length === 0) return;
    onChange([]);
    right.setSelected(new Set());
  };

  return {
    available,
    assigned,
    left,
    right,
    moveSelectedToAssigned,
    moveSelectedToAvailable,
    moveAllToAssigned,
    moveAllToAvailable,
  };
}
