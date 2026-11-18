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
import { readCare, type PendingCare } from "./pendingCare";

export type PetStorageIssue = "load" | "save" | "invalid" | "newer";
export class PetStorageError extends Error {
  constructor(public issue: PetStorageIssue) {
    super(issue);
  }
}

/** 계정에 올릴 돌봄 하나. id는 브라우저에서 만들어 같은 돌봄이 두 번 올라가지 않게 함 */
export type OutboxCare = PendingCare & { id: string; petId: string };
/** 이 브라우저의 까미가 어느 계정 것인지와, 아직 계정에 올리지 못한 돌봄 */
export type PetAccount = { userId: string; outbox: OutboxCare[] };
/**
 * 브라우저에 저장한 것 전부. 계정 까미면 pet은 "계정에서 받은 까미 + outbox"를 적용한 모습.
 * 게스트 까미면 account가 null (로그인하면 통째로 올림, src/features/sync/petSync.ts)
 */
export type PetRecord = { pet: PetProfile | null; account: PetAccount | null };

/** 저장 위치를 화면에서 분리. 화면(store)은 까미만 보고, 계정 맞추기는 PetRecord를 씁니다. */
export interface PetRepository {
  load(): Promise<PetProfile | null>;
  /** care: 이번에 함께 쓰는 돌봄. 계정 까미면 올릴 목록(outbox)에도 넣음 */
  update(
    change: (current: PetProfile | null) => PetProfile | null,
    care?: () => readonly PendingCare[],
  ): Promise<PetProfile | null>;
  clear(): Promise<void>;
}

export interface LocalPetRepository extends PetRepository {
  loadRecord(): Promise<PetRecord>;
  updateRecord(change: (record: PetRecord) => PetRecord): Promise<PetRecord>;
}

const VERSION = 9;
/** 저장 형식 버전. 계정(pet_game.version)에도 같은 값을 씀 */
export const PET_STORAGE_VERSION = VERSION;

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
  return decodeRecord(raw).pet;
}

function readAccount(value: unknown): PetAccount | null {
  if (!value || typeof value !== "object") return null;
  const { userId, outbox } = value as Partial<
    Record<keyof PetAccount, unknown>
  >;
  if (typeof userId !== "string" || userId.length === 0) return null;
  const list = Array.isArray(outbox) ? outbox : [];
  return {
    userId,
    outbox: list.flatMap((entry: Partial<OutboxCare>) => {
      const care = readCare(entry);
      const { id, petId } = entry ?? {};
      return care && typeof id === "string" && typeof petId === "string"
        ? [{ ...care, id, petId }]
        : [];
    }),
  };
}

export function decodeRecord(raw: string | null): PetRecord {
  if (raw === null) return { pet: null, account: null };
  let saved;
  try {
    saved = JSON.parse(raw);
  } catch {
    throw new PetStorageError("invalid");
  }
  const state = saved?.state;
  const hasPet = state && typeof state === "object" && "pet" in state;
  const pet = readSavedPet(saved?.version, hasPet ? state.pet : undefined);
  return { pet, account: readAccount(saved.account) };
}

/**
 * A Kkami saved in any format up to this one, in this browser or the account (pet_game).
 * Throws "newer" for a later format and "invalid" for anything that cannot be read.
 */
export function readSavedPet(
  version: unknown,
  pet: unknown,
): PetProfile | null {
  if ((version as number) > VERSION) throw new PetStorageError("newer");
  if (!Number.isInteger(version) || (version as number) < 1)
    throw new PetStorageError("invalid");
  if (pet === null) return null;
  if (!isLegacyPetProfile(pet)) throw new PetStorageError("invalid");
  const full: unknown = { ...pet, ...missingFields(version as number, pet) };
  if (!isPetProfile(full)) throw new PetStorageError("invalid");
  // Copy what is kept, leaving out anything unknown.
  return copyPet(full);
}

function copyPet(full: PetProfile): PetProfile {
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
  newId: () => string = () => crypto.randomUUID(),
): LocalPetRepository {
  function read() {
    let raw;
    try {
      raw = storage().getItem(STORAGE_KEYS.pet);
    } catch {
      throw new PetStorageError("load");
    }
    return decodeRecord(raw);
  }
  /** An account's Kkami: what is written now also waits to go up. */
  function queue(
    account: PetAccount | null,
    pet: PetProfile | null,
    entries: readonly PendingCare[],
  ): PetAccount | null {
    if (!account || !pet || entries.length === 0) return account;
    const queued = entries.map((entry) => ({
      ...entry,
      id: newId(),
      petId: pet.id,
    }));
    return { ...account, outbox: [...account.outbox, ...queued] };
  }
  function write(next: PetRecord, current: PetRecord) {
    if (JSON.stringify(next) === JSON.stringify(current)) return;
    try {
      storage().setItem(
        STORAGE_KEYS.pet,
        JSON.stringify({
          version: VERSION,
          state: { pet: next.pet },
          ...(next.account && { account: next.account }),
        }),
      );
    } catch {
      throw new PetStorageError("save");
    }
  }
  return {
    load: async () => read().pet,
    loadRecord: async () => read(),
    update: (change, care) =>
      lock(async () => {
        // Read under the same lock as the write: stale tabs cannot replace a newer count.
        const current = read();
        const pet = change(current.pet);
        const account = queue(current.account, pet, care?.() ?? []);
        write({ pet, account }, current);
        return pet;
      }),
    updateRecord: (change) =>
      lock(async () => {
        const current = read();
        const next = change(current);
        write(next, current);
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
