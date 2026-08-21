import { useEffect, useState } from "react";

/**
 * Persists hidden author ids for private notes in localStorage.
 */
export const useHiddenAuthors = (textId: string) => {
  const [hiddenAuthors, setHiddenAuthors] = useState<Set<string>>(new Set());

  useEffect(() => {
    const raw = localStorage.getItem(`guided-reader:notes-hidden:${textId}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as string[];
        setHiddenAuthors(new Set(parsed));
      } catch {
        setHiddenAuthors(new Set());
      }
    } else {
      setHiddenAuthors(new Set());
    }
  }, [textId]);

  useEffect(() => {
    localStorage.setItem(
      `guided-reader:notes-hidden:${textId}`,
      JSON.stringify(Array.from(hiddenAuthors)),
    );
  }, [textId, hiddenAuthors]);

  /**
   * Toggles visibility for an author.
   */
  const handleToggle = (authorId: string, checked: boolean) => {
    setHiddenAuthors((prev) => {
      const next = new Set(prev);
      if (checked) next.delete(authorId);
      else next.add(authorId);
      return next;
    });
  };

  return { hiddenAuthors, handleToggle };
};
