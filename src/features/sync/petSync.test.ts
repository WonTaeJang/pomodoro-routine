import { describe, expect, it } from "vitest";
import { STORAGE_KEYS } from "@/lib/storage";
import { createPetProfile, type PetProfile } from "@/features/pet/profile";
import { createLocalPetRepository } from "@/features/pet/repository";
import { createPetStore } from "@/features/pet/store";
import type { PetGameRow, PetHistoryInsert, PetHistoryRow } from "./petRows";
import { createPetSync, SETTLE_MS } from "./petSync";

const USER = "user-1";

/** pet_game·pet_game_history를 흉내 낸 서버. created_at은 줄마다 1ms씩 늘어남 */
function fakeServer() {
  let now = Date.parse("2026-11-18T00:00:00Z");
  let game: PetGameRow | null = null;
  let history: PetHistoryRow[] = [];
  const calls = { create: 0, compact: 0 };
  const stamp = () => `${new Date(++now).toISOString().slice(0, -1)}123+00:00`;
  return {
    calls,
    get game() {
      return game;
    },
    set game(value) {
      game = value;
    },
    get history() {
      return history;
    },
    now: () => now,
    advance: (ms: number) => {
      now += ms;
    },
    addRow: (row: Omit<PetHistoryRow, "created_at">) => {
      history.push({ ...row, created_at: stamp() });
    },
    api: {
      fetchGame: async () => structuredClone(game),
      createGame: async (pet: PetProfile) => {
        calls.create++;
        if (game) return false;
        game = { pet: structuredClone(pet), version: 9, history_until: null };
        return true;
      },
      compactGame: async (pet: PetProfile, until: string) => {
        calls.compact++;
        if (game && (game.history_until === null || game.history_until < until))
          game = { ...game, pet: structuredClone(pet), history_until: until };
      },
      fetchHistory: async (after: string | null) =>
        structuredClone(
          history.filter((row) => after === null || row.created_at > after),
        ),
      uploadHistory: async (rows: PetHistoryInsert[]) => {
        for (const { user_id: owner, ...row } of rows) {
          expect(owner).toBe(USER);
          if (!history.some((saved) => saved.id === row.id))
            history.push({ ...row, created_at: stamp() });
        }
      },
    },
    /** 하루 지난, 정리된 줄 지우기 (pg_cron) */
    cleanup: () => {
      const until = game?.history_until;
      if (until) history = history.filter((row) => row.created_at > until);
    },
  };
}
type Server = ReturnType<typeof fakeServer>;

let devices = 0;
function fakeDevice(server: Server, userId = USER) {
  const tag = ++devices;
  const data = new Map<string, string>();
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  } as Storage;
  let queue: Promise<unknown> = Promise.resolve();
  const lock = <T>(run: () => Promise<T>): Promise<T> => {
    const result = queue.then(run);
    queue = result.catch(() => {});
    return result;
  };
  let ids = 0;
  const repository = createLocalPetRepository(
    () => storage,
    lock,
    () =>
      `0000000${tag % 10}-0000-4000-8000-${String(++ids).padStart(12, "0")}`,
  );
  let clock = Date.parse("2026-11-18T09:00:00");
  const store = createPetStore(
    repository,
    () => ++clock,
    () => `pet-${tag}`,
  );
  const sync = createPetSync({
    userId,
    // 테스트에서 바꿔 끼울 수 있게 부를 때마다 찾음
    fetchGame: () => server.api.fetchGame(),
    createGame: (pet) => server.api.createGame(pet),
    compactGame: (pet, until) => server.api.compactGame(pet, until),
    fetchHistory: (after) => server.api.fetchHistory(after),
    uploadHistory: (rows) => server.api.uploadHistory(rows),
    loadRecord: () => repository.loadRecord(),
    updateRecord: (change) => repository.updateRecord(change),
    reload: () => void store.getState().hydrate(),
    now: () => server.now(),
  });
  return {
    data,
    store,
    repository,
    sync,
    /** 시작: 불러오고 까미를 만남 (다마고치 화면) */
    open: async () => {
      await store.getState().hydrate();
      await store.getState().meet();
    },
    pat: async (times = 1) => {
      for (let i = 0; i < times; i++) await store.getState().recordPat();
    },
    /** 맞추고 화면 store까지 다시 불러온 뒤 */
    run: async (compact = false) => {
      const ok = await sync.sync({ refresh: compact });
      await store.getState().hydrate();
      return ok;
    },
    pet: () => store.getState().pet,
    outbox: async () => (await repository.loadRecord()).account?.outbox ?? [],
  };
}

describe("pet account sync", () => {
  it("first login: a guest Kkami goes up as the account's Kkami", async () => {
    const server = fakeServer();
    const a = fakeDevice(server);
    await a.open();
    await a.pat(2);
    expect(await a.outbox()).toEqual([]);

    expect(await a.run()).toBe(true);
    expect(server.game?.pet).toEqual(a.pet());
    expect((server.game?.pet as PetProfile).totalPats).toBe(2);
    expect(server.history).toEqual([]);
    expect((await a.repository.loadRecord()).account).toEqual({
      userId: USER,
      outbox: [],
    });
  });

  it("an account Kkami replaces a different one in this browser", async () => {
    const server = fakeServer();
    const a = fakeDevice(server);
    await a.open();
    await a.pat(2);
    await a.run();

    const b = fakeDevice(server);
    await b.open();
    await b.pat(7);
    await b.run();
    expect(b.pet()).toEqual(a.pet());
    expect(server.calls.create).toBe(1);
  });

  it("care on two devices adds up", async () => {
    const server = fakeServer();
    const a = fakeDevice(server);
    await a.open();
    await a.pat(2);
    await a.run();
    const b = fakeDevice(server);
    await b.store.getState().hydrate();
    await b.run();

    await a.pat(3);
    await b.pat(1);
    expect(await a.outbox()).toHaveLength(3);
    await a.run();
    await b.run();
    await a.run();

    expect(a.pet()?.totalPats).toBe(6);
    expect(b.pet()?.totalPats).toBe(6);
    expect(a.pet()).toEqual(b.pet());
    expect(await a.outbox()).toEqual([]);
    expect(await b.outbox()).toEqual([]);
    expect(server.history).toHaveLength(4);
  });

  it("uploading twice keeps one row", async () => {
    const server = fakeServer();
    const a = fakeDevice(server);
    await a.open();
    await a.run();
    await a.pat(1);
    const [entry] = await a.outbox();
    await server.api.uploadHistory([
      {
        user_id: USER,
        id: entry.id,
        pet_id: entry.petId,
        kind: "pats",
        day: entry.day,
        at: new Date(entry.at).toISOString(),
        count: 1,
        item: null,
        furniture: null,
        slot: null,
      },
    ]);
    await a.run();
    expect(server.history).toHaveLength(1);
    expect(a.pet()?.totalPats).toBe(1);
  });

  it("opening the screen folds settled care into the account Kkami", async () => {
    const server = fakeServer();
    const a = fakeDevice(server);
    await a.open();
    await a.run();
    await a.pat(3);
    await a.run();
    server.advance(SETTLE_MS + 1);
    const b = fakeDevice(server);
    await b.store.getState().hydrate();
    await b.run();
    await b.pat(1);
    await b.run(true);

    // b's pat is the latest, a's three are settled.
    expect(server.calls.compact).toBe(1);
    expect((server.game?.pet as PetProfile).totalPats).toBe(3);
    expect(server.game?.history_until).toBe(server.history[2].created_at);

    // Cleaning up folded rows changes nothing for either device.
    server.cleanup();
    expect(server.history).toHaveLength(1);
    await a.run();
    await b.run();
    expect(a.pet()?.totalPats).toBe(4);
    expect(b.pet()).toEqual(a.pet());
  });

  it("keeps the last few seconds and unknown rows out of the fold", async () => {
    const server = fakeServer();
    const a = fakeDevice(server);
    await a.open();
    await a.run();
    await a.pat(1);
    await a.run();
    await a.run(true);
    expect(server.calls.compact).toBe(0);

    server.addRow({
      id: "00000009-0000-4000-8000-000000000001",
      pet_id: a.pet()!.id,
      kind: "dance",
      day: "2026-11-18",
      at: "2026-11-18T09:00:00Z",
      count: 1,
      item: null,
      furniture: null,
      slot: null,
    });
    server.advance(SETTLE_MS + 1);
    await a.pat(1);
    await a.run(true);
    expect(server.calls.compact).toBe(1);
    expect(server.game?.history_until).toBe(server.history[0].created_at);
    expect(a.pet()?.totalPats).toBe(2);
  });

  it("folds the latest row too once it has settled", async () => {
    const server = fakeServer();
    const a = fakeDevice(server);
    await a.open();
    await a.run();
    await a.pat(2);
    await a.run();
    server.advance(SETTLE_MS + 1);
    await a.run(true);
    expect(server.game?.history_until).toBe(server.history[1].created_at);
    expect((server.game?.pet as PetProfile).totalPats).toBe(2);
  });

  it("does not move the fold back", async () => {
    const server = fakeServer();
    const a = fakeDevice(server);
    await a.open();
    await a.run();
    await a.pat(2);
    await a.run();
    server.advance(SETTLE_MS + 1);
    await a.pat(1);
    await a.run(true);
    const until = server.game!.history_until;
    await server.api.compactGame(
      createPetProfile("old", 0),
      "2000-01-01T00:00:00Z",
    );
    expect(server.game?.history_until).toBe(until);
  });

  it("someone else's Kkami left in this browser is removed, not uploaded", async () => {
    const server = fakeServer();
    const a = fakeDevice(server);
    await a.repository.updateRecord(() => ({
      pet: createPetProfile("theirs", 1),
      account: { userId: "user-2", outbox: [] },
    }));
    await a.run();
    expect(server.calls.create).toBe(0);
    expect(a.data.has(STORAGE_KEYS.pet)).toBe(true);
    expect(await a.repository.loadRecord()).toEqual({
      pet: null,
      account: null,
    });
  });

  it("follows the account when another device uploaded first", async () => {
    const server = fakeServer();
    const first = fakeDevice(server);
    await first.open();
    await first.pat(4);
    const b = fakeDevice(server);
    await b.open();
    // b sees an empty account, then first uploads before b does.
    const fetchGame = server.api.fetchGame;
    let calls = 0;
    server.api.fetchGame = async () => {
      if (calls++ === 0) {
        await first.run();
        return null;
      }
      return fetchGame();
    };
    await b.run();
    expect(b.pet()?.id).toBe(first.pet()?.id);
    expect(b.pet()?.totalPats).toBe(4);
  });

  it("writes nothing after it is stopped (log out)", async () => {
    const server = fakeServer();
    const a = fakeDevice(server);
    await a.open();
    await a.run();
    const b = fakeDevice(server);
    await b.open();
    const before = b.data.get(STORAGE_KEYS.pet);
    let release!: () => void;
    const fetchHistory = server.api.fetchHistory;
    server.api.fetchHistory = async (after) => {
      await new Promise<void>((resolve) => (release = resolve));
      return fetchHistory(after);
    };
    const running = b.sync.sync();
    await new Promise((resolve) => setTimeout(resolve));
    b.sync.stop();
    release();
    expect(await running).toBe(false);
    expect(b.data.get(STORAGE_KEYS.pet)).toBe(before);
  });

  it("leaves everything alone when the account was saved by a newer app", async () => {
    const server = fakeServer();
    const a = fakeDevice(server);
    await a.open();
    await a.run();
    server.game = { ...server.game!, version: 99 };
    await a.pat(1);
    const before = a.data.get(STORAGE_KEYS.pet);
    expect(await a.run()).toBe(false);
    expect(a.data.get(STORAGE_KEYS.pet)).toBe(before);
    expect(server.history).toEqual([]);
  });
});
