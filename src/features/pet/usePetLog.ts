"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AFFINITY_PER_SNACK } from "./affinity";
import type { ItemId } from "./items";
import type { FurnitureId, LookId, Slot } from "./furniture";
import { petStore } from "./store";

export type PetLogEvent =
  | { kind: "enter" | "wake" | "walkOut" | "home" | "stamp" | "palace" }
  | { kind: "pat"; points: number; total: number }
  | { kind: "snack"; points: number }
  | { kind: "found" | "skipped"; item: ItemId }
  | { kind: "level"; level: number }
  | { kind: "walkLimit" | "snackLimit"; count: number }
  | { kind: "craft"; furniture: FurnitureId }
  | { kind: "place"; slot: Slot; look: LookId };
export type PetLogEntry = PetLogEvent & { id: number; at: number };

/** Enough for a long visit; older lines drop off. */
export const LOG_LIMIT = 30;
let nextId = 0;

/**
 * What happened since the page opened, newest first. Kept in memory only:
 * a reload starts a new log. Pats and treats come from saved records.
 */
export function usePetLog() {
  const [entries, setEntries] = useState<PetLogEntry[]>([]);
  const add = useCallback((event: PetLogEvent) => {
    const entry = { ...event, id: nextId++, at: Date.now() };
    setEntries((current) => [entry, ...current].slice(0, LOG_LIMIT));
  }, []);

  // The visit starts on the client: server rendering has no clock of its own.
  // Once per page, even when development mode runs effects twice.
  const entered = useRef(false);
  useEffect(() => {
    if (entered.current) return;
    entered.current = true;
    queueMicrotask(() => add({ kind: "enter" }));
  }, [add]);

  useEffect(
    () =>
      petStore.subscribe(({ pet }, { pet: before }) => {
        if (!pet || !before || pet.id !== before.id) return;
        const snacks = pet.totalSnacks - before.totalSnacks;
        const pats = pet.totalPats - before.totalPats;
        const snackPoints = Math.max(0, snacks) * AFFINITY_PER_SNACK;
        const points = pet.affinity.points - before.affinity.points;
        if (pats > 0)
          add({
            kind: "pat",
            points: points - snackPoints,
            total: pet.totalPats,
          });
        if (snacks > 0) add({ kind: "snack", points: snackPoints });
      }),
    [add],
  );

  return { entries, add };
}
