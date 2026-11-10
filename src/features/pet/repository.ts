import { STORAGE_KEYS } from "@/lib/storage";
import { isPetProfile, type PetProfile } from "./profile";

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

const VERSION = 1;
export function decodePet(raw: string | null): PetProfile | null {
  if (raw === null) return null;
  let saved;
  try {
    saved = JSON.parse(raw);
  } catch {
    throw new PetStorageError("invalid");
  }
  if (saved?.version > VERSION) throw new PetStorageError("newer");
  // v1 is the first persisted format. Future migrations belong here.
  if (
    saved?.version !== VERSION ||
    !saved.state ||
    typeof saved.state !== "object" ||
    !("pet" in saved.state)
  )
    throw new PetStorageError("invalid");
  const pet: unknown = saved.state.pet;
  if (pet !== null && !isPetProfile(pet)) throw new PetStorageError("invalid");
  if (pet === null) return null;
  const { id, createdAt, totalPats, lastPettedAt, updatedAt } = pet;
  return { id, createdAt, totalPats, lastPettedAt, updatedAt };
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
