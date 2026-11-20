import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import { createPetProfile, type PetProfile } from "./profile";
import { totalItems, type ItemId } from "./items";
import type { FurnitureId, Placed, Slot } from "./furniture";
import {
  appendCare,
  applyPending,
  careEntry,
  pendingCounts,
  type CareInput,
  type PendingCare,
} from "./pendingCare";
import {
  createLocalPetRepository,
  PetStorageError,
  type PetRepository,
  type PetStorageIssue,
} from "./repository";

type PetStore = {
  pet: PetProfile | null;
  hydrated: boolean;
  issue: PetStorageIssue | null;
  pendingPats: number;
  pendingSnacks: number;
  retryOperation: "save" | "clear" | null;
  hydrate(): Promise<void>;
  meet(): Promise<void>;
  recordPat(): Promise<void>;
  recordSnack(): Promise<void>;
  /** A finished walk and the item it brought home. */
  recordWalk(item: ItemId): Promise<void>;
  /** Make a piece of furniture from the items left over. */
  recordCraft(furniture: FurnitureId): Promise<void>;
  /** Put furniture in a slot, or its starting look back with null. */
  recordPlace(slot: Slot, furniture: FurnitureId | null): Promise<void>;
  /** Put several pieces in their places in one save (a room set). */
  recordPlaceAll(pieces: Placed): Promise<void>;
  /** The item box was opened: clear the new-item dot. */
  markItemsSeen(): Promise<void>;
  retry(): Promise<void>;
  clear(): Promise<void>;
};

/** 명시적 저장 액션만 기록. UI 상태 변경·수면 재생은 저장을 발생시키지 않습니다. */
export function createPetStore(
  repository: PetRepository,
  now = Date.now,
  id = () => crypto.randomUUID(),
) {
  let queue = Promise.resolve();
  const enqueue = (action: () => Promise<void>) => {
    queue = queue.then(action);
    return queue;
  };
  return createStore<PetStore>()((set, get) => {
    let persistedId: string | null = null;
    // Keep the last base separate from optimistic rewards. Replaying pending
    // day batches against fresh disk data must not count rewards twice.
    let basePet: PetProfile | null = null;
    let pending: PendingCare[] = [];
    const remotelyReset = (current: PetProfile | null) =>
      persistedId !== null && current?.id !== persistedId;
    function showPending() {
      set({
        pet: basePet && applyPending(basePet, pending),
        ...pendingCounts(pending),
      });
    }
    function acceptSaved(saved: PetProfile | null) {
      basePet = saved;
      persistedId = saved?.id ?? null;
      pending = [];
      set({
        pet: saved,
        ...pendingCounts(pending),
        retryOperation: null,
        issue: null,
      });
    }
    const fail = (error: unknown) =>
      set({ issue: error instanceof PetStorageError ? error.issue : "save" });
    async function flush(...fresh: PendingCare[]) {
      const { pet } = get();
      if (!pet) return;
      // A new save supersedes a previously failed deletion.
      set({ retryOperation: "save" });
      try {
        const saved = await repository.update(
          (current) => {
            // Check under the write lock: the storage event may not have arrived.
            // Retry discards old work; an explicit new action can start a new record.
            if (remotelyReset(current)) {
              pending = fresh.reduce<PendingCare[]>(appendCare, []);
              basePet =
                current ??
                (fresh.length > 0 ? createPetProfile(id(), fresh[0].at) : null);
              persistedId = current?.id ?? null;
              showPending();
            }
            const base = current ?? basePet;
            return base ? applyPending(base, pending) : null;
          },
          () => pending,
        );
        acceptSaved(saved);
      } catch (error) {
        fail(error);
      }
    }
    async function clearRecord() {
      set({ retryOperation: "clear" });
      try {
        await repository.clear();
        acceptSaved(null);
      } catch (error) {
        fail(error);
      }
    }
    async function restore() {
      try {
        const saved = await repository.load();
        const { retryOperation, issue } = get();
        // Only a previously observed identity can prove a remote reset.
        // A temporary ID created during a read failure is not such evidence.
        const deletionCompleted = retryOperation === "clear" && saved === null;
        if (
          remotelyReset(saved) ||
          deletionCompleted ||
          retryOperation === null
        ) {
          acceptSaved(saved);
        } else {
          basePet = saved ?? basePet;
          showPending();
          set({
            // Reading successfully does not mean pending writes/deletion succeeded.
            issue: issue ?? "save",
          });
        }
        persistedId = saved?.id ?? null;
      } catch (error) {
        fail(error);
      }
      set({ hydrated: true });
    }
    /** Several inputs land together: one update on screen, one save. */
    function recordCare(...inputs: CareInput[]) {
      const at = now();
      const entries = inputs.map((input) => careEntry(input, at));
      return enqueue(async () => {
        if (!get().hydrated || entries.length === 0) return;
        basePet ??= createPetProfile(id(), at);
        pending = entries.reduce(appendCare, pending);
        showPending();
        await flush(...entries);
      });
    }
    return {
      pet: null,
      hydrated: false,
      issue: null,
      pendingPats: 0,
      pendingSnacks: 0,
      retryOperation: null,
      hydrate: () => enqueue(restore),
      meet: () =>
        enqueue(async () => {
          if (!get().hydrated || get().pet) return;
          basePet = createPetProfile(id(), now());
          set({ pet: basePet });
          await flush();
        }),
      recordPat: () => recordCare({ kind: "pats" }),
      recordSnack: () => recordCare({ kind: "snacks" }),
      recordWalk: (item) => recordCare({ kind: "walks", item }),
      recordCraft: (furniture) => recordCare({ kind: "craft", furniture }),
      recordPlace: (slot, furniture) =>
        recordCare({ kind: "place", slot, furniture }),
      recordPlaceAll: (pieces) =>
        recordCare(
          ...Object.entries(pieces).map(([slot, furniture]): CareInput => ({
            kind: "place",
            slot: slot as Slot,
            furniture,
          })),
        ),
      markItemsSeen: () => {
        const pet = get().pet;
        if (!pet || pet.itemsSeen >= totalItems(pet.items))
          return Promise.resolve();
        return recordCare({ kind: "seen", count: totalItems(pet.items) });
      },
      retry: () =>
        enqueue(() => {
          if (get().retryOperation === "clear") return clearRecord();
          return get().pet ? flush() : restore();
        }),
      clear: () => enqueue(clearRecord),
    };
  });
}

/** 이 브라우저의 까미 저장소. 계정 맞추기(src/features/sync)도 같은 것을 씀 */
export const petRepository = createLocalPetRepository();
export const petStore = createPetStore(petRepository);
export const usePetStore = <T>(selector: (state: PetStore) => T): T =>
  useStore(petStore, selector);
