"use client";

import type { ItemId } from "./items";
import { DAILY_WALKS, walksOn, type PetProfile } from "./profile";
import { petStore } from "./store";
import { useDailyLimitReached } from "./useDailyLimit";
import type { PetLogEvent } from "./usePetLog";
import { useWalkTrip } from "./useWalkTrip";
import { FOUND_CARD_MS } from "./walkTrip";
import { useMoment } from "./useMoment";

type Options = {
  /** The saved record: past walks (the first cannot be skipped) and today's. */
  pet: PetProfile | null;
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
export function usePetWalkFlow({ pet, walk, returnHome, addLog }: Options) {
  const card = useMoment<ItemId>(FOUND_CARD_MS);
  const outOfWalks = useDailyLimitReached(pet, walksOn, DAILY_WALKS);

  const { trip, begin, step, skip, cancel } = useWalkTrip({
    onFound: (item, skipped) => {
      void petStore.getState().recordWalk(item);
      card.show(item);
      addLog(skipped ? { kind: "skipped", item } : { kind: "found", item });
    },
    onDone: (skipped) => {
      if (!skipped) addLog({ kind: "home" });
      returnHome();
    },
  });

  /** Out of walks, the key only answers with a line in the log. */
  function start() {
    if (outOfWalks) {
      addLog({ kind: "walkLimit", count: DAILY_WALKS });
      return;
    }
    begin((pet?.walks ?? 0) > 0);
    addLog({ kind: "walkOut" });
    walk();
  }
  /** The walk could not load: back home without an item. */
  function leave() {
    cancel();
    returnHome();
  }

  return { trip, card, outOfWalks, start, step, skip, leave };
}
