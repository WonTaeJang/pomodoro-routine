import { describe, expect, it } from "vitest";
import { STORAGE_KEYS } from "@/lib/storage";
import { careEntry, readCare } from "./pendingCare";
import { createPetProfile } from "./profile";
import { createLocalPetRepository, decodeRecord } from "./repository";

function memoryStorage() {
  const data = new Map<string, string>();
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  } as Storage;
  return { data, storage };
}

const noLock = <T>(run: () => Promise<T>) => run();
const at = Date.parse("2026-11-18T09:00:00");

function setup() {
  const { data, storage } = memoryStorage();
  let n = 0;
  const repository = createLocalPetRepository(
    () => storage,
    noLock,
    () => `id-${++n}`,
  );
  return { data, repository };
}

describe("readCare", () => {
  it("keeps known kinds and fields only", () => {
    const pat = careEntry({ kind: "pats" }, at);
    expect(readCare({ ...pat, extra: 1 })).toEqual(pat);
    expect(readCare({ ...pat, kind: "dance" })).toBeNull();
    expect(readCare({ ...pat, count: -1 })).toBeNull();
    expect(readCare({ ...pat, day: "2026-13-01" })).toBeNull();
    expect(
      readCare({ ...careEntry({ kind: "walks", item: "leaf" }, at) }),
    ).toMatchObject({ kind: "walks", item: "leaf" });
    expect(readCare({ ...pat, kind: "walks", item: "rock" })).toBeNull();
    expect(
      readCare(careEntry({ kind: "place", slot: "rug", furniture: null }, at)),
    ).toMatchObject({ kind: "place", slot: "rug", furniture: null });
  });
});

describe("local pet record", () => {
  it("a guest Kkami queues nothing for the account", async () => {
    const { repository } = setup();
    const pet = createPetProfile("pet-1", at);
    await repository.update(
      () => pet,
      () => [careEntry({ kind: "pats" }, at)],
    );
    expect(await repository.loadRecord()).toEqual({ pet, account: null });
  });

  it("an account Kkami queues what is written, with an id and the Kkami", async () => {
    const { data, repository } = setup();
    const pet = createPetProfile("pet-1", at);
    await repository.updateRecord(() => ({
      pet,
      account: { userId: "user-1", outbox: [] },
    }));
    const pat = careEntry({ kind: "pats" }, at);
    const walk = careEntry({ kind: "walks", item: "leaf" }, at + 1);
    await repository.update(
      (current) => current,
      () => [pat, walk],
    );
    const record = await repository.loadRecord();
    expect(record.account?.outbox).toEqual([
      { ...pat, id: "id-1", petId: "pet-1" },
      { ...walk, id: "id-2", petId: "pet-1" },
    ]);
    // Read back the same after a reload, and the pet part is unchanged.
    expect(decodeRecord(data.get(STORAGE_KEYS.pet)!)).toEqual(record);
    expect(await repository.load()).toEqual(pet);
  });

  it("drops a broken queued entry but keeps the rest", () => {
    const pet = createPetProfile("pet-1", at);
    const pat = { ...careEntry({ kind: "pats" }, at), id: "a", petId: "pet-1" };
    const raw = JSON.stringify({
      version: 9,
      state: { pet },
      account: { userId: "user-1", outbox: [pat, { kind: "pats" }, null] },
    });
    expect(decodeRecord(raw).account).toEqual({
      userId: "user-1",
      outbox: [pat],
    });
  });

  it("clear removes the account part too", async () => {
    const { repository } = setup();
    await repository.updateRecord(() => ({
      pet: createPetProfile("pet-1", at),
      account: { userId: "user-1", outbox: [] },
    }));
    await repository.clear();
    expect(await repository.loadRecord()).toEqual({ pet: null, account: null });
  });
});
