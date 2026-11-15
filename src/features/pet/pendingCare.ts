import { affinityDay } from "./affinity";
import type { ItemId } from "./items";
import type { FurnitureId, Slot } from "./furniture";
import {
  addPats,
  addSnacks,
  addWalks,
  makeFurniture,
  placeFurniture,
  seeItems,
  type PetProfile,
} from "./profile";

/** One thing to save: a pat, a treat, a walk and its find, or opening the box. */
export type CareInput =
  | { kind: "pats" | "snacks" }
  | { kind: "walks"; item: ItemId }
  /** The items found when the box was opened. */
  | { kind: "seen"; count: number }
  | { kind: "craft"; furniture: FurnitureId }
  /** Null puts the starting look back. */
  | { kind: "place"; slot: Slot; furniture: FurnitureId | null };
export type PendingCare = {
  day: string;
  /** Pats/snacks/walks: how many. Seen: items found when the box was opened. */
  count: number;
  at: number;
} & (
  | { kind: "pats" | "snacks" | "seen" }
  | { kind: "walks"; item: ItemId }
  | { kind: "craft"; furniture: FurnitureId }
  | { kind: "place"; slot: Slot; furniture: FurnitureId | null }
);

export function careEntry(input: CareInput, at: number): PendingCare {
  return { count: 1, ...input, at, day: affinityDay(at) };
}

const itemOf = (care: PendingCare) =>
  care.kind === "walks" ? care.item : undefined;
function sameBatch(a: PendingCare, b: PendingCare) {
  if (a.kind !== b.kind) return false;
  switch (a.kind) {
    case "seen":
      return true;
    case "craft":
      return a.furniture === (b as typeof a).furniture;
    case "place":
      return a.slot === (b as typeof a).slot;
    default:
      return a.day === b.day && itemOf(a) === itemOf(b);
  }
}

/** Keep the input date and time even when saving waits or fails. */
export function appendCare(
  pending: readonly PendingCare[],
  entry: PendingCare,
): PendingCare[] {
  const index = pending.findIndex((p) => sameBatch(p, entry));
  if (index < 0) return [...pending, entry];
  return pending.map((p, i) => {
    if (i !== index) return p;
    const at = Math.max(p.at, entry.at);
    switch (p.kind) {
      case "seen":
        // Seen marks a level, not an amount: keep the highest.
        return { ...p, count: Math.max(p.count, entry.count), at };
      case "craft":
        // One of each piece: making it again changes nothing.
        return p;
      case "place":
        // The latest choice for a slot wins.
        return entry;
      default:
        return { ...p, count: p.count + entry.count, at };
    }
  });
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
      case "craft":
        return makeFurniture(pet, entry.furniture, entry.at);
      case "place":
        return placeFurniture(pet, entry.slot, entry.furniture, entry.at);
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
