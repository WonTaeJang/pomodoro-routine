import {
  affinityDay,
  AFFINITY_PER_SNACK,
  createAffinity,
  isAffinity,
  rewardPats,
  type Affinity,
} from "./affinity";
import {
  isItemCounts,
  totalItems,
  type ItemCounts,
  type ItemId,
} from "./items";
import {
  availableItems,
  canMake,
  furnitureById,
  isFurnitureId,
  isSlot,
  type FurnitureId,
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
};

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
): PetProfile {
  return {
    ...pet,
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
): PetProfile {
  return {
    ...pet,
    walks: pet.walks + amount,
    items: { ...pet.items, [item]: (pet.items[item] ?? 0) + amount },
    updatedAt: Math.max(now, pet.updatedAt),
  };
}

/** Never moves back, and never past what was actually found. */
export function seeItems(pet: PetProfile, seen: number): PetProfile {
  const itemsSeen = Math.min(
    totalItems(pet.items),
    Math.max(pet.itemsSeen, seen),
  );
  return itemsSeen === pet.itemsSeen ? pet : { ...pet, itemsSeen };
}

/** Make a piece from the items left over. Does nothing if made or short. */
export function makeFurniture(
  pet: PetProfile,
  id: FurnitureId,
  now: number,
): PetProfile {
  if (
    pet.furniture.includes(id) ||
    !canMake(id, availableItems(pet.items, pet.spent))
  )
    return pet;
  const spent = { ...pet.spent };
  for (const [item, count] of Object.entries(furnitureById(id).need))
    spent[item as ItemId] = (spent[item as ItemId] ?? 0) + count;
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
  if (id && (!pet.furniture.includes(id) || furnitureById(id).slot !== slot))
    return pet;
  const placed = { ...pet.placed };
  if (id) placed[slot] = id;
  else delete placed[slot];
  return { ...pet, placed, updatedAt: Math.max(now, pet.updatedAt) };
}

function isFurnitureState(p: Partial<PetProfile>): boolean {
  const { items, spent, furniture, placed } = p;
  if (!isItemCounts(spent) || !Array.isArray(furniture)) return false;
  if (!placed || typeof placed !== "object" || Array.isArray(placed))
    return false;
  return (
    Object.entries(spent).every(
      ([item, count]) => count! <= (items?.[item as ItemId] ?? 0),
    ) &&
    furniture.every(isFurnitureId) &&
    new Set(furniture).size === furniture.length &&
    Object.entries(placed).every(
      ([slot, id]) =>
        isSlot(slot) &&
        isFurnitureId(id) &&
        furniture.includes(id) &&
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
    isFurnitureState(p)
  );
}
