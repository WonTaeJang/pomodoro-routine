import { affinityDay } from "./affinity";
import { addPats, addSnacks, type PetProfile } from "./profile";

export type CareKind = "pats" | "snacks";
export type PendingCare = {
  kind: CareKind;
  day: string;
  count: number;
  at: number;
};

export function careEntry(kind: CareKind, at: number): PendingCare {
  return { kind, at, day: affinityDay(at), count: 1 };
}

/** Keep the input date and time even when saving waits or fails. */
export function appendCare(
  pending: readonly PendingCare[],
  entry: PendingCare,
): PendingCare[] {
  const index = pending.findIndex(
    (p) => p.kind === entry.kind && p.day === entry.day,
  );
  if (index < 0) return [...pending, entry];
  return pending.map((p, i) =>
    i === index
      ? { ...p, count: p.count + entry.count, at: Math.max(p.at, entry.at) }
      : p,
  );
}

export function applyPending(
  base: PetProfile,
  pending: readonly PendingCare[],
): PetProfile {
  return pending.reduce(
    (pet, entry) =>
      entry.kind === "pats"
        ? addPats(pet, entry.count, entry.at, entry.day)
        : addSnacks(pet, entry.count, entry.at),
    base,
  );
}

export function pendingCounts(pending: readonly PendingCare[]) {
  return pending.reduce(
    (counts, entry) => {
      if (entry.kind === "pats") counts.pendingPats += entry.count;
      else counts.pendingSnacks += entry.count;
      return counts;
    },
    { pendingPats: 0, pendingSnacks: 0 },
  );
}
