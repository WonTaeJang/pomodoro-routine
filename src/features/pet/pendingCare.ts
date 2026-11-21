import { affinityDay, isDayKey } from "./affinity";
import { isItemId, type ItemId } from "./items";
import {
  isFurnitureId,
  isSlot,
  type FurnitureId,
  type Slot,
} from "./furniture";
import {
  addPats,
  addSnacks,
  addWalks,
  makeFurniture,
  receiveGift,
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
  | { kind: "place"; slot: Slot; furniture: FurnitureId | null }
  /** The day's VIP gift box opened (I-070). */
  | { kind: "gift" };
export type PendingCare = {
  day: string;
  /** Pats/snacks/walks: how many. Seen: items found when the box was opened. */
  count: number;
  at: number;
} & (
  | { kind: "pats" | "snacks" | "seen" | "gift" }
  | { kind: "walks"; item: ItemId }
  | { kind: "craft"; furniture: FurnitureId }
  | { kind: "place"; slot: Slot; furniture: FurnitureId | null }
);

const isCount = (n: unknown): n is number =>
  Number.isSafeInteger(n) && (n as number) >= 0;

/** A saved entry read back (this browser's queue or the account): only known kinds and fields. */
export function readCare(value: unknown): PendingCare | null {
  if (!value || typeof value !== "object") return null;
  const c = value as Record<string, unknown>;
  if (!isDayKey(c.day) || !isCount(c.count) || !isCount(c.at)) return null;
  const base = { day: c.day, count: c.count, at: c.at };
  switch (c.kind) {
    case "pats":
    case "snacks":
    case "seen":
    case "gift":
      return { ...base, kind: c.kind };
    case "walks":
      return isItemId(c.item) ? { ...base, kind: c.kind, item: c.item } : null;
    case "craft":
      return isFurnitureId(c.furniture)
        ? { ...base, kind: c.kind, furniture: c.furniture }
        : null;
    case "place":
      return isSlot(c.slot) &&
        (c.furniture === null || isFurnitureId(c.furniture))
        ? { ...base, kind: c.kind, slot: c.slot, furniture: c.furniture }
        : null;
    default:
      return null;
  }
}

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
        return addSnacks(pet, entry.count, entry.at, entry.day);
      case "walks":
        return addWalks(pet, entry.item, entry.count, entry.at, entry.day);
      case "seen":
        return seeItems(pet, entry.count);
      case "craft":
        return makeFurniture(pet, entry.furniture, entry.at);
      case "place":
        return placeFurniture(pet, entry.slot, entry.furniture, entry.at);
      case "gift":
        return receiveGift(pet, entry.at, entry.day);
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
