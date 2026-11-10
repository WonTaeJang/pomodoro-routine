import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import { addPats, createPetProfile, type PetProfile } from "./profile";
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
  hydrate(): Promise<void>;
  meet(): Promise<void>;
  recordPat(): Promise<void>;
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
    let clearPending = false;
    const fail = (error: unknown) =>
      set({ issue: error instanceof PetStorageError ? error.issue : "save" });
    async function flush() {
      const { pet, pendingPats } = get();
      if (!pet) return;
      try {
        const saved = await repository.update((current) => {
          const base =
            current ??
            (persistedId === pet.id
              ? createPetProfile(id(), now())
              : { ...pet, totalPats: pet.totalPats - pendingPats });
          return pendingPats ? addPats(base, pendingPats, pet.updatedAt) : base;
        });
        set({ pet: saved, pendingPats: 0, issue: null });
        persistedId = saved?.id ?? null;
      } catch (error) {
        fail(error);
      }
    }
    async function clearRecord() {
      clearPending = true;
      try {
        await repository.clear();
        persistedId = null;
        clearPending = false;
        set({ pet: null, pendingPats: 0, issue: null });
      } catch (error) {
        fail(error);
      }
    }
    async function restore() {
      try {
        const saved = await repository.load();
        const { pet, pendingPats } = get();
        if (
          pendingPats &&
          pet &&
          (persistedId === null || saved?.id === persistedId)
        ) {
          const base = saved ?? {
            ...pet,
            totalPats: pet.totalPats - pendingPats,
          };
          set({ pet: addPats(base, pendingPats, pet.updatedAt) });
        } else {
          set({ pet: saved, pendingPats: 0, issue: null });
        }
        persistedId = saved?.id ?? null;
      } catch (error) {
        fail(error);
      }
      set({ hydrated: true });
    }
    return {
      pet: null,
      hydrated: false,
      issue: null,
      pendingPats: 0,
      hydrate: () => enqueue(restore),
      meet: () =>
        enqueue(async () => {
          if (!get().hydrated || get().pet) return;
          set({ pet: createPetProfile(id(), now()) });
          await flush();
        }),
      recordPat: () =>
        enqueue(async () => {
          if (!get().hydrated) return;
          const pet = get().pet ?? createPetProfile(id(), now());
          set({
            pet: addPats(pet, 1, now()),
            pendingPats: get().pendingPats + 1,
          });
          await flush();
        }),
      retry: () => enqueue(() => (clearPending ? clearRecord() : flush())),
      clear: () => enqueue(clearRecord),
    };
  });
}

export const petStore = createPetStore(createLocalPetRepository());
export const usePetStore = <T>(selector: (state: PetStore) => T): T =>
  useStore(petStore, selector);
