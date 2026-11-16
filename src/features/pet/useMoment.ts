"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

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
  const show = useCallback(
    (next: T) => setValue({ value: next, key: Date.now() }),
    [],
  );
  return {
    value: value?.value ?? null,
    /** Changes with every show, to replay an entrance animation. */
    key: value?.key ?? 0,
    show,
  };
}

/**
 * True for `ms` after `start` (a performance.now() time). Turns true in the
 * same render `start` is set, so there is no gap before it.
 */
export function useUntil(start: number | null, ms: number): boolean {
  const deadline = start === null ? null : start + ms;
  const [passed, setPassed] = useState<number | null>(null);
  useEffect(() => {
    if (deadline === null) return;
    const timer = setTimeout(
      () => setPassed(deadline),
      Math.max(0, deadline - performance.now()),
    );
    return () => clearTimeout(timer);
  }, [deadline]);
  return deadline !== null && passed !== deadline;
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
