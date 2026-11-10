/** 영구 기록. Rive와 페이지 수명에 종속된 상태는 포함하지 않습니다. */
export type PetProfile = {
  id: string;
  createdAt: number;
  totalPats: number;
  lastPettedAt: number | null;
  updatedAt: number;
};

export function createPetProfile(id: string, now: number): PetProfile {
  return {
    id,
    createdAt: now,
    totalPats: 0,
    lastPettedAt: null,
    updatedAt: now,
  };
}

export function addPats(
  pet: PetProfile,
  amount: number,
  now: number,
): PetProfile {
  const at = Math.max(now, pet.updatedAt);
  return {
    ...pet,
    totalPats: Math.min(Number.MAX_SAFE_INTEGER, pet.totalPats + amount),
    lastPettedAt: at,
    updatedAt: at,
  };
}

export function isPetProfile(value: unknown): value is PetProfile {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<PetProfile>;
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
