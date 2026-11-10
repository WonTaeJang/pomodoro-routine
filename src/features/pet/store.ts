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
  retryOperation: "save" | "clear" | null;
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
    const fail = (error: unknown) =>
      set({ issue: error instanceof PetStorageError ? error.issue : "save" });
    async function flush() {
      const { pet, pendingPats } = get();
      if (!pet) return;
      // A new save supersedes a previously failed deletion.
      set({ retryOperation: "save" });
      try {
        const saved = await repository.update((current) => {
          const base =
            current ??
            (persistedId === pet.id
              ? createPetProfile(id(), now())
              : { ...pet, totalPats: pet.totalPats - pendingPats });
          return pendingPats ? addPats(base, pendingPats, pet.updatedAt) : base;
        });
        set({ pet: saved, pendingPats: 0, retryOperation: null, issue: null });
        persistedId = saved?.id ?? null;
      } catch (error) {
        fail(error);
      }
    }
    async function clearRecord() {
      set({ retryOperation: "clear" });
      try {
        await repository.clear();
        persistedId = null;
        set({ pet: null, pendingPats: 0, retryOperation: null, issue: null });
      } catch (error) {
        fail(error);
      }
    }
    async function restore() {
      try {
        const saved = await repository.load();
        const { pet, pendingPats, retryOperation, issue } = get();
        // Only a previously observed identity can prove a remote reset.
        // A temporary ID created during a read failure is not such evidence.
        const remotelyReset = persistedId !== null && saved?.id !== persistedId;
        const deletionCompleted = retryOperation === "clear" && saved === null;
        if (remotelyReset || deletionCompleted || retryOperation === null) {
          set({
            pet: saved,
            pendingPats: 0,
            retryOperation: null,
            issue: null,
          });
        } else {
          const base =
            saved ??
            (pet && { ...pet, totalPats: pet.totalPats - pendingPats });
          set({
            pet:
              base && pet && pendingPats
                ? addPats(base, pendingPats, pet.updatedAt)
                : base,
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
    return {
      pet: null,
      hydrated: false,
      issue: null,
      pendingPats: 0,
      retryOperation: null,
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
      retry: () =>
        enqueue(() => {
          if (get().retryOperation === "clear") return clearRecord();
          return get().pet ? flush() : restore();
        }),
      clear: () => enqueue(clearRecord),
    };
  });
}

export const petStore = createPetStore(createLocalPetRepository());
export const usePetStore = <T>(selector: (state: PetStore) => T): T =>
  useStore(petStore, selector);
