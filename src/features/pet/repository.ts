import { STORAGE_KEYS } from "@/lib/storage";
import {
  NO_DAILY_SNACKS,
  NO_DAILY_WALKS,
  NO_FURNITURE,
  isLegacyPetProfile,
  isPetProfile,
  type LegacyPetProfile,
  type PetProfile,
} from "./profile";
import { createAffinity } from "./affinity";

export type PetStorageIssue = "load" | "save" | "invalid" | "newer";
export class PetStorageError extends Error {
  constructor(public issue: PetStorageIssue) {
    super(issue);
  }
}

/** 저장 위치를 화면에서 분리. 현재는 게스트 로컬 기록만 구현합니다. */
export interface PetRepository {
  load(): Promise<PetProfile | null>;
  update(
    change: (current: PetProfile | null) => PetProfile | null,
  ): Promise<PetProfile | null>;
  clear(): Promise<void>;
}

const VERSION = 9;

/**
 * What an older record lacks, as it would have been: v1 has no daily history
 * (past pats cannot earn affinity retroactively) and v1–2 no treats; v3 has
 * no walks or items; v4 no furniture; v5 no daily walk count; v8 and older
 * no daily treat count. v7 (walls, floors, rugs) and v8 (outfits) have the
 * shape of v6 but furniture that older builds would not know.
 */
function missingFields(version: number, pet: LegacyPetProfile) {
  return {
    ...(version < 3 && {
      totalSnacks: 0,
      affinity: version === 1 ? createAffinity() : (pet as PetProfile).affinity,
    }),
    ...(version < 4 && { walks: 0, items: {}, itemsSeen: 0 }),
    ...(version < 5 && NO_FURNITURE),
    ...(version < 6 && NO_DAILY_WALKS),
    ...(version < VERSION && NO_DAILY_SNACKS),
  };
}

export function decodePet(raw: string | null): PetProfile | null {
  if (raw === null) return null;
  let saved;
  try {
    saved = JSON.parse(raw);
  } catch {
    throw new PetStorageError("invalid");
  }
  if (saved?.version > VERSION) throw new PetStorageError("newer");
  if (
    !Number.isInteger(saved?.version) ||
    saved.version < 1 ||
    !saved.state ||
    typeof saved.state !== "object" ||
    !("pet" in saved.state)
  )
    throw new PetStorageError("invalid");
  const pet: unknown = saved.state.pet;
  if (pet === null) return null;
  if (!isLegacyPetProfile(pet)) throw new PetStorageError("invalid");
  const full: unknown = { ...pet, ...missingFields(saved.version, pet) };
  if (!isPetProfile(full)) throw new PetStorageError("invalid");
  // Copy what is kept, leaving out anything unknown.
  return {
    id: full.id,
    createdAt: full.createdAt,
    totalPats: full.totalPats,
    totalSnacks: full.totalSnacks,
    lastPettedAt: full.lastPettedAt,
    updatedAt: full.updatedAt,
    affinity: {
      points: full.affinity.points,
      rewardedPats: { ...full.affinity.rewardedPats },
    },
    walks: full.walks,
    items: { ...full.items },
    itemsSeen: full.itemsSeen,
    spent: { ...full.spent },
    furniture: [...full.furniture],
    placed: { ...full.placed },
    walkDay: full.walkDay,
    walksOnDay: full.walksOnDay,
    snackDay: full.snackDay,
    snacksOnDay: full.snacksOnDay,
  };
}

type Lock = <T>(run: () => Promise<T>) => Promise<T>;
const browserLock: Lock = async (run) =>
  typeof navigator !== "undefined" && navigator.locks
    ? await navigator.locks.request(STORAGE_KEYS.pet, run)
    : await run();

export function createLocalPetRepository(
  storage: () => Storage = () => localStorage,
  lock: Lock = browserLock,
): PetRepository {
  function read() {
    let raw;
    try {
      raw = storage().getItem(STORAGE_KEYS.pet);
    } catch {
      throw new PetStorageError("load");
    }
    return decodePet(raw);
  }
  return {
    load: async () => read(),
    update: (change) =>
      lock(async () => {
        // Read under the same lock as the write: stale tabs cannot replace a newer count.
        const current = read();
        const next = change(current);
        if (JSON.stringify(next) !== JSON.stringify(current)) {
          try {
            storage().setItem(
              STORAGE_KEYS.pet,
              JSON.stringify({ version: VERSION, state: { pet: next } }),
            );
          } catch {
            throw new PetStorageError("save");
          }
        }
        return next;
      }),
    clear: () =>
      lock(async () => {
        try {
          storage().removeItem(STORAGE_KEYS.pet);
        } catch {
          throw new PetStorageError("save");
        }
      }),
  };
}
