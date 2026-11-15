import { affinityDay } from "./affinity";
import type { ItemId } from "./items";
import {
  addPats,
  addSnacks,
  addWalks,
  seeItems,
  type PetProfile,
} from "./profile";

/** One thing to save: a pat, a treat, a walk and its find, or opening the box. */
export type CareInput =
  | { kind: "pats" | "snacks" }
  | { kind: "walks"; item: ItemId }
  /** The items found when the box was opened. */
  | { kind: "seen"; count: number };
export type PendingCare = {
  day: string;
  /** Pats/snacks/walks: how many. Seen: items found when the box was opened. */
  count: number;
  at: number;
} & ({ kind: "pats" | "snacks" | "seen" } | { kind: "walks"; item: ItemId });

export function careEntry(input: CareInput, at: number): PendingCare {
  return { count: 1, ...input, at, day: affinityDay(at) };
}

const itemOf = (care: PendingCare) =>
  care.kind === "walks" ? care.item : undefined;
const sameBatch = (a: PendingCare, b: PendingCare) =>
  a.kind === b.kind &&
  (a.kind === "seen" || (a.day === b.day && itemOf(a) === itemOf(b)));

/** Keep the input date and time even when saving waits or fails. */
export function appendCare(
  pending: readonly PendingCare[],
  entry: PendingCare,
): PendingCare[] {
  const index = pending.findIndex((p) => sameBatch(p, entry));
  if (index < 0) return [...pending, entry];
  return pending.map((p, i) =>
    i === index
      ? {
          ...p,
          // Seen marks a level, not an amount: keep the highest.
          count:
            p.kind === "seen"
              ? Math.max(p.count, entry.count)
              : p.count + entry.count,
          at: Math.max(p.at, entry.at),
        }
      : p,
  );
}

export function applyPending(
  base: PetProfile,
  pending: readonly PendingCare[],
): PetProfile {
  return pending.reduce((pet, entry) => {
    switch (entry.kind) {
      case "pats":
        return addPats(pet, entry.count, entry.at, entry.day);
      case "snacks":
        return addSnacks(pet, entry.count, entry.at);
      case "walks":
        return addWalks(pet, entry.item, entry.count, entry.at);
      case "seen":
        return seeItems(pet, entry.count);
    }
  }, base);
}

export function pendingCounts(pending: readonly PendingCare[]) {
  return pending.reduce(
    (counts, entry) => {
      if (entry.kind === "pats") counts.pendingPats += entry.count;
      else if (entry.kind === "snacks") counts.pendingSnacks += entry.count;
      return counts;
    },
    { pendingPats: 0, pendingSnacks: 0 },
  );
}
