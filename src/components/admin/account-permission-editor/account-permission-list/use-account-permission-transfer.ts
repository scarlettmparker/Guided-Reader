import { useEffect, useMemo, useState } from "react";
import { usePageData } from "@sun/ssr/react";
import type { AllPermissionsQuery } from "~/generated/graphql";

type AllPermissionsData = AllPermissionsQuery["gaiaQueries"]["allPermissions"];

/**
 * State for account permission transfer.
 */
export function useAccountPermissionTransfer(
  assignedPermissions: string[],
  onChange: (next: string[]) => void,
) {
  const { data: allPermissions } = usePageData<AllPermissionsData>(
    "allPermissions",
    "admin/all-permissions",
    {},
  );
  const [availableQuery, setAvailableQuery] = useState("");
  const [assignedQuery, setAssignedQuery] = useState("");
  const [input, setInput] = useState("");
  const [selectedAvailable, setSelectedAvailable] = useState<Set<string>>(
    new Set(),
  );
  const [selectedAssigned, setSelectedAssigned] = useState<Set<string>>(
    new Set(),
  );
  const [drag, setDrag] = useState<{ active: boolean; target: boolean } | null>(
    null,
  );

  useEffect(() => {
    const end = () => setDrag(null);
    window.addEventListener("mouseup", end);
    return () => window.removeEventListener("mouseup", end);
  }, []);

  const assigned = useMemo(
    () => [...assignedPermissions].sort((a, b) => a.localeCompare(b)),
    [assignedPermissions],
  );

  const availableFilteredBase = useMemo(() => {
    const catalog = (allPermissions ?? []) as string[];
    return catalog
      .filter((p) => !assigned.includes(p))
      .sort((a, b) => a.localeCompare(b));
  }, [assigned, allPermissions]);

  const filteredAvailable = useMemo(() => {
    const q = availableQuery.toLowerCase();
    return q
      ? availableFilteredBase.filter((v) => v.toLowerCase().includes(q))
      : availableFilteredBase;
  }, [availableFilteredBase, availableQuery]);

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
   * Handles add custom permission.
   */
  const handleAdd = () => {
    const value = input.trim();
    if (!value || assigned.includes(value)) {
      setInput("");
      return;
    }
    onChange([...assigned, value].sort((a, b) => a.localeCompare(b)));
    setInput("");
  };

  /**
   * Moves selected available to assigned.
   */
  const moveSelectedToAssigned = () => {
    if (selectedAvailable.size === 0) return;
    const toMove = [...selectedAvailable].filter((v) =>
      availableFilteredBase.includes(v),
    );
    onChange(
      [...new Set([...assigned, ...toMove])].sort((a, b) => a.localeCompare(b)),
    );
    setSelectedAvailable(new Set());
  };

  /**
   * Moves selected assigned to available.
   */
  const moveSelectedToAvailable = () => {
    if (selectedAssigned.size === 0) return;
    onChange(assigned.filter((v) => !selectedAssigned.has(v)));
    setSelectedAssigned(new Set());
  };

  /**
   * Moves all filtered available to assigned.
   */
  const moveAllToAssigned = () => {
    if (filteredAvailable.length === 0) return;
    onChange(
      [...new Set([...assigned, ...filteredAvailable])].sort((a, b) =>
        a.localeCompare(b),
      ),
    );
    setSelectedAvailable(new Set());
  };

  /**
   * Moves all filtered assigned to available.
   */
  const moveAllToAvailable = () => {
    if (filteredAssigned.length === 0) return;
    const remove = new Set(filteredAssigned);
    onChange(assigned.filter((v) => !remove.has(v)));
    setSelectedAssigned(new Set());
  };

  /**
   * Handles drag start for available.
   */
  const handleDragStartAvailable = (value: string) => (e: React.DragEvent) => {
    const toDrag = selectedAvailable.has(value)
      ? [...selectedAvailable]
      : [value];
    e.dataTransfer.setData("application/json", JSON.stringify(toDrag));
  };

  /**
   * Handles drag start for assigned.
   */
  const handleDragStartAssigned = (value: string) => (e: React.DragEvent) => {
    const toDrag = selectedAssigned.has(value)
      ? [...selectedAssigned]
      : [value];
    e.dataTransfer.setData("application/json", JSON.stringify(toDrag));
  };

  /**
   * Handles drop to assigned.
   */
  const handleDropToAssigned = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const raw =
        e.dataTransfer.getData("application/json") ||
        e.dataTransfer.getData("text/plain");
      const values: string[] = raw.startsWith("[") ? JSON.parse(raw) : [raw];
      const valid = values.filter(
        (v) => v && availableFilteredBase.includes(v),
      );
      if (valid.length === 0) return;
      onChange(
        [...new Set([...assigned, ...valid])].sort((a, b) =>
          a.localeCompare(b),
        ),
      );
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
      const raw =
        e.dataTransfer.getData("application/json") ||
        e.dataTransfer.getData("text/plain");
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

  /**
   * Handles remove one.
   */
  const handleRemoveOne = (value: string) => {
    onChange(assigned.filter((v) => v !== value));
    setSelectedAssigned((prev) => {
      const n = new Set(prev);
      n.delete(value);
      return n;
    });
  };

  return {
    assigned,
    availableFilteredBase,
    filteredAvailable,
    filteredAssigned,
    availableQuery,
    setAvailableQuery,
    assignedQuery,
    setAssignedQuery,
    input,
    setInput,
    selectedAvailable,
    selectedAssigned,
    onAvailableMouseDown,
    onAvailableMouseEnter,
    onAssignedMouseDown,
    onAssignedMouseEnter,
    handleAdd,
    moveSelectedToAssigned,
    moveSelectedToAvailable,
    moveAllToAssigned,
    moveAllToAvailable,
    handleDragStartAvailable,
    handleDragStartAssigned,
    handleDropToAssigned,
    handleDropToAvailable,
    handleRemoveOne,
  };
}
