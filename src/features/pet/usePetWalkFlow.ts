"use client";

import { useEffect, useState } from "react";
import type { ItemId } from "./items";
import { petStore } from "./store";
import type { PetLogEvent } from "./usePetLog";
import { useWalkTrip } from "./useWalkTrip";
import { FOUND_CARD_MS } from "./walkTrip";

type Options = {
  /** Walks finished so far; the first one cannot be skipped. */
  walks: number;
  /** Care state: leave the room and come back. */
  walk: () => void;
  returnHome: () => void;
  addLog: (event: PetLogEvent) => void;
};

/**
 * A walk on the pet page: out to a find, pick it up, home. Saves the find,
 * writes the log and shows the find card, which outlives the walk so a skip
 * still shows what came back.
 */
export function usePetWalkFlow({ walks, walk, returnHome, addLog }: Options) {
  const [card, setCard] = useState<{ item: ItemId; key: number } | null>(null);
  useEffect(() => {
    if (!card) return;
    const timer = setTimeout(() => setCard(null), FOUND_CARD_MS);
    return () => clearTimeout(timer);
  }, [card]);

  const { trip, begin, step, skip, cancel } = useWalkTrip({
    onFound: (item, skipped) => {
      void petStore.getState().recordWalk(item);
      setCard({ item, key: Date.now() });
      addLog(skipped ? { kind: "skipped", item } : { kind: "found", item });
    },
    onDone: (skipped) => {
      if (!skipped) addLog({ kind: "home" });
      returnHome();
    },
  });

  function start() {
    begin(walks > 0);
    addLog({ kind: "walkOut" });
    walk();
  }
  /** The walk could not load: back home without an item. */
  function leave() {
    cancel();
    returnHome();
  }

  return { trip, card, start, step, skip, leave };
}
