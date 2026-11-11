export const AFFINITY_PER_PAT = 2;
export const AFFINITY_PER_SNACK = 3;
export const DAILY_AFFINITY_PATS = 5;
export const AFFINITY_THRESHOLDS = [0, 20, 60, 140, 300] as const;

export type Affinity = {
  points: number;
  /** Counts only rewarded pats. Retain dates so late retries share the same cap. */
  rewardedPats: Record<string, number>;
};

export function createAffinity(): Affinity {
  return { points: 0, rewardedPats: {} };
}

/** A calendar date in the device's timezone, captured when the pat happens. */
export function affinityDay(at: number): string {
  const date = new Date(at);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function rewardPats(
  affinity: Affinity,
  count: number,
  day: string,
): Affinity {
  const used = affinity.rewardedPats[day] ?? 0;
  const earned = Math.min(count, DAILY_AFFINITY_PATS - used);
  if (earned <= 0) return affinity;
  return {
    points: affinity.points + earned * AFFINITY_PER_PAT,
    rewardedPats: { ...affinity.rewardedPats, [day]: used + earned },
  };
}

export function affinityProgress(points: number) {
  let index = 0;
  while (
    index < AFFINITY_THRESHOLDS.length - 1 &&
    points >= AFFINITY_THRESHOLDS[index + 1]
  )
    index++;
  const floor = AFFINITY_THRESHOLDS[index];
  const next = AFFINITY_THRESHOLDS[index + 1] as number | undefined;
  return {
    level: (index + 1) as 1 | 2 | 3 | 4 | 5,
    next: next ?? null,
    value: next === undefined ? 1 : points - floor,
    max: next === undefined ? 1 : next - floor,
  };
}

export function isAffinity(value: unknown, totalSnacks = 0): value is Affinity {
  if (!value || typeof value !== "object") return false;
  const a = value as Partial<Affinity>;
  if (
    !Number.isSafeInteger(a.points) ||
    a.points! < 0 ||
    !a.rewardedPats ||
    typeof a.rewardedPats !== "object" ||
    Array.isArray(a.rewardedPats)
  )
    return false;
  let sum = 0;
  for (const [day, count] of Object.entries(a.rewardedPats)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
    const date = new Date(`${day}T00:00:00Z`);
    if (
      !Number.isFinite(date.getTime()) ||
      date.toISOString().slice(0, 10) !== day
    )
      return false;
    if (!Number.isInteger(count) || count < 1 || count > DAILY_AFFINITY_PATS)
      return false;
    sum += count;
  }
  return sum * AFFINITY_PER_PAT + totalSnacks * AFFINITY_PER_SNACK === a.points;
}
