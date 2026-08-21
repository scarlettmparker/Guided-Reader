import { useEffect, useMemo, useState } from "react";
import type { RolesQuery } from "~/generated/graphql";

type RolesData = RolesQuery["gaiaQueries"]["roles"];

/**
 * State for role transfer.
 */
export function useRoleTransfer(
  roles: RolesData,
  assignedRoleNames: string[],
  onChange: (next: string[]) => void,
) {
  const [availableQuery, setAvailableQuery] = useState("");
  const [assignedQuery, setAssignedQuery] = useState("");
  const [selectedAvailable, setSelectedAvailable] = useState<Set<string>>(new Set());
  const [selectedAssigned, setSelectedAssigned] = useState<Set<string>>(new Set());
  const [drag, setDrag] = useState<{ active: boolean; target: boolean } | null>(null);

  useEffect(() => {
    const end = () => setDrag(null);
    window.addEventListener("mouseup", end);
    return () => window.removeEventListener("mouseup", end);
  }, []);

  const allNames = useMemo(
    () => (roles ?? []).map((r) => r.name).sort((a, b) => a.localeCompare(b)),
    [roles],
  );
  const assigned = useMemo(
    () => [...assignedRoleNames].sort((a, b) => a.localeCompare(b)),
    [assignedRoleNames],
  );
  const available = useMemo(
    () => allNames.filter((n) => !assigned.includes(n)),
    [allNames, assigned],
  );

  const filteredAvailable = useMemo(() => {
    const q = availableQuery.toLowerCase();
    return q ? available.filter((v) => v.toLowerCase().includes(q)) : available;
  }, [available, availableQuery]);

  const filteredAssigned = useMemo(() => {
    const q = assignedQuery.toLowerCase();
    return q ? assigned.filter((v) => v.toLowerCase().includes(q)) : assigned;
  }, [assigned, assignedQuery]);

  /**
   * Sets available selection.
   */
  const setAvailable = (id: string, target: boolean) => {
    setSelectedAvailable((prev) => {
      const next = new Set(prev);
      if (target) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  /**
   * Sets assigned selection.
   */
  const setAssigned = (id: string, target: boolean) => {
    setSelectedAssigned((prev) => {
      const next = new Set(prev);
      if (target) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  /**
   * Handles mouse down on available.
   */
  const onAvailableMouseDown = (value: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const target = !selectedAvailable.has(value);
    setDrag({ active: true, target });
    setAvailable(value, target);
  };

  /**
   * Handles mouse enter on available.
   */
  const onAvailableMouseEnter = (value: string) => () => {
    if (drag?.active) setAvailable(value, drag.target);
  };

  /**
   * Handles mouse down on assigned.
   */
  const onAssignedMouseDown = (value: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const target = !selectedAssigned.has(value);
    setDrag({ active: true, target });
    setAssigned(value, target);
  };

  /**
   * Handles mouse enter on assigned.
   */
  const onAssignedMouseEnter = (value: string) => () => {
    if (drag?.active) setAssigned(value, drag.target);
  };

  /**
   * Moves selected available to assigned.
   */
  const moveSelectedToAssigned = () => {
    if (selectedAvailable.size === 0) return;
    const toMove = [...selectedAvailable].filter((v) => available.includes(v));
    const next = [...assigned, ...toMove].sort((a, b) => a.localeCompare(b));
    onChange([...new Set(next)]);
    setSelectedAvailable(new Set());
  };

  /**
   * Moves selected assigned to available.
   */
  const moveSelectedToAvailable = () => {
    if (selectedAssigned.size === 0) return;
    const next = assigned.filter((v) => !selectedAssigned.has(v));
    onChange(next);
    setSelectedAssigned(new Set());
  };

  /**
   * Moves all filtered available to assigned.
   */
  const moveAllToAssigned = () => {
    if (filteredAvailable.length === 0) return;
    const next = [...assigned, ...filteredAvailable].sort((a, b) => a.localeCompare(b));
    onChange([...new Set(next)]);
    setSelectedAvailable(new Set());
  };

  /**
   * Moves all filtered assigned to available.
   */
  const moveAllToAvailable = () => {
    if (filteredAssigned.length === 0) return;
    const remove = new Set(filteredAssigned);
    const next = assigned.filter((v) => !remove.has(v));
    onChange(next);
    setSelectedAssigned(new Set());
  };

  /**
   * Handles drag start for available.
   */
  const handleDragStartAvailable = (value: string) => (e: React.DragEvent) => {
    const toDrag = selectedAvailable.has(value) ? [...selectedAvailable] : [value];
    e.dataTransfer.setData("application/json", JSON.stringify(toDrag));
    e.dataTransfer.effectAllowed = "move";
  };

  /**
   * Handles drag start for assigned.
   */
  const handleDragStartAssigned = (value: string) => (e: React.DragEvent) => {
    const toDrag = selectedAssigned.has(value) ? [...selectedAssigned] : [value];
    e.dataTransfer.setData("application/json", JSON.stringify(toDrag));
    e.dataTransfer.effectAllowed = "move";
  };

  /**
   * Handles drop to assigned.
   */
  const handleDropToAssigned = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const raw = e.dataTransfer.getData("application/json") || e.dataTransfer.getData("text/plain");
      const values: string[] = raw.startsWith("[") ? JSON.parse(raw) : [raw];
      const valid = values.filter((v) => v && available.includes(v));
      if (valid.length === 0) return;
      onChange([...new Set([...assigned, ...valid])].sort((a, b) => a.localeCompare(b)));
      setSelectedAvailable(new Set());
    } catch {
      // ignore
    }
  };

  /**
   * Handles drop to available.
   */
  const handleDropToAvailable = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const raw = e.dataTransfer.getData("application/json") || e.dataTransfer.getData("text/plain");
      const values: string[] = raw.startsWith("[") ? JSON.parse(raw) : [raw];
      const valid = values.filter((v) => v && assigned.includes(v));
      if (valid.length === 0) return;
      const remove = new Set(valid);
      onChange(assigned.filter((v) => !remove.has(v)));
      setSelectedAssigned(new Set());
    } catch {
      // ignore
    }
  };

  return {
    available,
    assigned,
    filteredAvailable,
    filteredAssigned,
    availableQuery,
    setAvailableQuery,
    assignedQuery,
    setAssignedQuery,
    selectedAvailable,
    selectedAssigned,
    onAvailableMouseDown,
    onAvailableMouseEnter,
    onAssignedMouseDown,
    onAssignedMouseEnter,
    moveSelectedToAssigned,
    moveSelectedToAvailable,
    moveAllToAssigned,
    moveAllToAvailable,
    handleDragStartAvailable,
    handleDragStartAssigned,
    handleDropToAssigned,
    handleDropToAvailable,
  };
}
