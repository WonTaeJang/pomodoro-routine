import {
  affinityDay,
  AFFINITY_PER_SNACK,
  createAffinity,
  isAffinity,
  rewardPats,
  type Affinity,
} from "./affinity";

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
};

export function createPetProfile(id: string, now: number): PetProfile {
  return {
    id,
    createdAt: now,
    totalPats: 0,
    totalSnacks: 0,
    lastPettedAt: null,
    updatedAt: now,
    affinity: createAffinity(),
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
    isAffinity(p.affinity, p.totalSnacks)
  );
}
