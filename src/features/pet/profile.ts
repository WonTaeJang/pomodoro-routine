import {
  affinityDay,
  AFFINITY_PER_SNACK,
  createAffinity,
  isAffinity,
  isDayKey,
  levelHearts,
  rewardPats,
  type Affinity,
} from "./affinity";
import {
  isItemCounts,
  isItemId,
  totalItems,
  type ItemCounts,
  type ItemId,
} from "./items";
import {
  availableItems,
  canMake,
  furnitureById,
  heartsSpent,
  stampsSpent,
  isFree,
  isFurnitureId,
  isSlot,
  owns,
  type FurnitureId,
  type MaterialCounts,
  type Placed,
  type Slot,
} from "./furniture";

export type LegacyPetProfile = {
  id: string;
  createdAt: number;
  totalPats: number;
  lastPettedAt: number | null;
  updatedAt: number;
};

/** 영구 기록. 단계는 친밀도 점수에서 계산하고 애니메이션은 저장하지 않습니다. */
export type PetProfile = LegacyPetProfile & {
  affinity: Affinity;
  totalSnacks: number;
  /** Finished walks. Every walk brings home exactly one item. */
  walks: number;
  items: ItemCounts;
  /** Items found when the box was last opened; more shows the new-item dot. */
  itemsSeen: number;
  /** Items used up making furniture. `items` keeps counting every find. */
  spent: ItemCounts;
  /** Furniture made so far, at most one of each. */
  furniture: FurnitureId[];
  /** Furniture placed in each slot; a missing slot shows its starting look. */
  placed: Placed;
  /** Walks on the latest walking day (local date), for the daily limit. */
  walkDay: string | null;
  walksOnDay: number;
  /** Treats on the latest treat day (local date), for the daily limit. */
  snackDay: string | null;
  snacksOnDay: number;
};

/** Walks a day; the walk key rests after that until the next day. */
export const DAILY_WALKS = 5;
/** What a record from before the daily limit starts with. */
export const NO_DAILY_WALKS = { walkDay: null, walksOnDay: 0 } as const;

/** Treats a day; the treat key rests after that until the next day. */
export const DAILY_SNACKS = 5;
/** What a record from before the daily treat limit starts with. */
export const NO_DAILY_SNACKS = { snackDay: null, snacksOnDay: 0 } as const;

/**
 * Count for the latest day: a newer day starts again, the same day adds, and
 * a late save for an older day changes nothing (null).
 */
function countForDay(
  latest: string | null,
  count: number,
  day: string,
  amount: number,
): [string, number] | null {
  if (latest === null || day > latest) return [day, amount];
  return day === latest ? [day, count + amount] : null;
}

/** What a record from before furniture starts with. */
export const NO_FURNITURE = { spent: {}, furniture: [], placed: {} } as const;

export function createPetProfile(id: string, now: number): PetProfile {
  return {
    id,
    createdAt: now,
    totalPats: 0,
    totalSnacks: 0,
    lastPettedAt: null,
    updatedAt: now,
    affinity: createAffinity(),
    walks: 0,
    items: {},
    itemsSeen: 0,
    spent: {},
    furniture: [],
    placed: {},
    ...NO_DAILY_WALKS,
    ...NO_DAILY_SNACKS,
  };
}

export function addPats(
  pet: PetProfile,
  amount: number,
  now: number,
  day = affinityDay(now),
): PetProfile {
  const at = Math.max(now, pet.updatedAt);
  return {
    ...pet,
    totalPats: Math.min(Number.MAX_SAFE_INTEGER, pet.totalPats + amount),
    lastPettedAt: Math.max(now, pet.lastPettedAt ?? pet.createdAt),
    updatedAt: at,
    affinity: rewardPats(pet.affinity, amount, day),
  };
}

export function addSnacks(
  pet: PetProfile,
  amount: number,
  now: number,
  day = affinityDay(now),
): PetProfile {
  const daily = countForDay(pet.snackDay, pet.snacksOnDay, day, amount);
  return {
    ...pet,
    ...(daily && { snackDay: daily[0], snacksOnDay: daily[1] }),
    totalSnacks: pet.totalSnacks + amount,
    updatedAt: Math.max(now, pet.updatedAt),
    affinity: {
      ...pet.affinity,
      points: pet.affinity.points + amount * AFFINITY_PER_SNACK,
    },
  };
}

export function addWalks(
  pet: PetProfile,
  item: ItemId,
  amount: number,
  now: number,
  day = affinityDay(now),
): PetProfile {
  const daily = countForDay(pet.walkDay, pet.walksOnDay, day, amount);
  return {
    ...pet,
    ...(daily && { walkDay: daily[0], walksOnDay: daily[1] }),
    walks: pet.walks + amount,
    items: { ...pet.items, [item]: (pet.items[item] ?? 0) + amount },
    updatedAt: Math.max(now, pet.updatedAt),
  };
}

/** Walks taken on `day` (a local YYYY-MM-DD date). */
export function walksOn(pet: PetProfile, day: string): number {
  return pet.walkDay === day ? pet.walksOnDay : 0;
}

/** Treats given on a day; 0 for any other day. */
export function snacksOn(pet: PetProfile, day: string): number {
  return pet.snackDay === day ? pet.snacksOnDay : 0;
}

/** Never moves back, and never past what was actually found. */
export function seeItems(pet: PetProfile, seen: number): PetProfile {
  const itemsSeen = Math.min(
    totalItems(pet.items),
    Math.max(pet.itemsSeen, seen),
  );
  return itemsSeen === pet.itemsSeen ? pet : { ...pet, itemsSeen };
}

/**
 * Finds, hearts and paw stamps left to make things with. Stamps are earned
 * outside this record (finished cycles), so the caller passes how many.
 */
export function materialsLeft(pet: PetProfile, stamps = 0): MaterialCounts {
  const hearts = levelHearts(pet.affinity.points) - heartsSpent(pet.furniture);
  const stampsLeft = stamps - stampsSpent(pet.furniture);
  return {
    ...availableItems(pet.items, pet.spent),
    ...(hearts > 0 && { heart: hearts }),
    ...(stampsLeft > 0 && { stamp: stampsLeft }),
  };
}

/**
 * Making a piece checks finds and hearts. Paw stamps are checked before the
 * craft is recorded (the item box knows the count): a saved craft replays on
 * another device even before its focus records arrive.
 */
const NO_STAMP_LIMIT = { stamp: Number.MAX_SAFE_INTEGER };

/** Make a piece from what is left. Does nothing if made, free or short. */
export function makeFurniture(
  pet: PetProfile,
  id: FurnitureId,
  now: number,
): PetProfile {
  if (
    pet.furniture.includes(id) ||
    isFree(id) ||
    !canMake(id, { ...materialsLeft(pet), ...NO_STAMP_LIMIT })
  )
    return pet;
  // Hearts and stamps are counted from what was made; finds are counted as spent.
  const spent = { ...pet.spent };
  for (const [material, count] of Object.entries(furnitureById(id).need))
    if (isItemId(material)) spent[material] = (spent[material] ?? 0) + count;
  return {
    ...pet,
    spent,
    furniture: [...pet.furniture, id],
    updatedAt: Math.max(now, pet.updatedAt),
  };
}

/** Put a made piece in its slot, or the starting look back with null. */
export function placeFurniture(
  pet: PetProfile,
  slot: Slot,
  id: FurnitureId | null,
  now: number,
): PetProfile {
  if ((pet.placed[slot] ?? null) === id) return pet;
  if (id && (!owns(pet.furniture, id) || furnitureById(id).slot !== slot))
    return pet;
  const placed = { ...pet.placed };
  if (id) placed[slot] = id;
  else delete placed[slot];
  return { ...pet, placed, updatedAt: Math.max(now, pet.updatedAt) };
}

/** A latest day and its count: none before the first, never above the total. */
function isDailyCount(day: unknown, count: unknown, total: number) {
  if (!Number.isSafeInteger(count) || (count as number) < 0) return false;
  if (day === null) return count === 0;
  return isDayKey(day) && (count as number) <= total;
}

function isFurnitureState(p: Partial<PetProfile>): boolean {
  const { items, spent, furniture, placed, affinity } = p;
  if (!isItemCounts(spent) || !Array.isArray(furniture)) return false;
  if (!placed || typeof placed !== "object" || Array.isArray(placed))
    return false;
  return (
    Object.entries(spent).every(
      ([item, count]) => count! <= (items?.[item as ItemId] ?? 0),
    ) &&
    furniture.every((id) => isFurnitureId(id) && !isFree(id)) &&
    new Set(furniture).size === furniture.length &&
    // Hearts come from level ups only.
    heartsSpent(furniture) <= levelHearts(affinity?.points ?? 0) &&
    Object.entries(placed).every(
      ([slot, id]) =>
        isSlot(slot) &&
        isFurnitureId(id) &&
        owns(furniture, id) &&
        furnitureById(id).slot === slot,
    )
  );
}

export function isLegacyPetProfile(value: unknown): value is LegacyPetProfile {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<LegacyPetProfile>;
  const timestamp = (n: unknown): n is number =>
    typeof n === "number" && Number.isSafeInteger(n) && n >= 0;
  return (
    typeof p.id === "string" &&
    p.id.length > 0 &&
    p.id.length <= 128 &&
    timestamp(p.createdAt) &&
    timestamp(p.updatedAt) &&
    p.updatedAt >= p.createdAt &&
    timestamp(p.totalPats) &&
    (p.lastPettedAt === null ||
      (timestamp(p.lastPettedAt) &&
        p.lastPettedAt >= p.createdAt &&
        p.lastPettedAt <= p.updatedAt))
  );
}

export function isPetProfile(value: unknown): value is PetProfile {
  if (!isLegacyPetProfile(value)) return false;
  const p = value as Partial<PetProfile>;
  return (
    typeof p.totalSnacks === "number" &&
    Number.isSafeInteger(p.totalSnacks) &&
    p.totalSnacks >= 0 &&
    isAffinity(p.affinity, p.totalSnacks) &&
    Number.isSafeInteger(p.walks) &&
    isItemCounts(p.items) &&
    totalItems(p.items) === p.walks &&
    Number.isSafeInteger(p.itemsSeen) &&
    p.itemsSeen! >= 0 &&
    p.itemsSeen! <= p.walks! &&
    isFurnitureState(p) &&
    isDailyCount(p.walkDay, p.walksOnDay, p.walks!) &&
    isDailyCount(p.snackDay, p.snacksOnDay, p.totalSnacks)
  );
}
