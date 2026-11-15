"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * A value shown for a moment, then cleared (a find card, a happy bubble).
 * Showing a new value restarts the time.
 */
export function useMoment<T>(ms: number) {
  const [value, setValue] = useState<{ value: T; key: number } | null>(null);
  useEffect(() => {
    if (!value) return;
    const timer = setTimeout(() => setValue(null), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return {
    value: value?.value ?? null,
    /** Changes with every show, to replay an entrance animation. */
    key: value?.key ?? 0,
    show: (next: T) => setValue({ value: next, key: Date.now() }),
  };
}

/** Put focus back on `target` when a mode (a walk, decorating) ends. */
export function useFocusAfter(
  active: boolean,
  target: RefObject<HTMLElement | null>,
) {
  const was = useRef(false);
  useEffect(() => {
    if (was.current && !active) target.current?.focus();
    was.current = active;
  }, [active, target]);
}
