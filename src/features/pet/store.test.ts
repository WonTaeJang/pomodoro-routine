import { describe, expect, it } from "vitest";
import { STORAGE_KEYS } from "@/lib/storage";
import { createPetCareStore } from "./careStore";
import { createPetStore } from "./store";
import {
  createLocalPetRepository,
  decodePet,
  PetStorageError,
} from "./repository";

function fixture() {
  const data = new Map<string, string>();
  let readFailure = false,
    writeFailure = false,
    clock = 1000,
    sequence = 0;
  const storage: Storage = {
    get length() {
      return data.size;
    },
    key: (index) => [...data.keys()][index] ?? null,
    clear: () => data.clear(),
    getItem: (key) => {
      if (readFailure) throw Error("blocked");
      return data.get(key) ?? null;
    },
    setItem: (key, value) => {
      if (writeFailure) throw Error("quota");
      data.set(key, value);
    },
    removeItem: (key) => {
      if (writeFailure) throw Error("blocked");
      data.delete(key);
    },
  };
  // Shared, exclusive lock models navigator.locks across two tabs.
  let queue: Promise<unknown> = Promise.resolve();
  const lock = <T>(run: () => Promise<T>): Promise<T> => {
    const result = queue.then(run);
    queue = result.catch(() => {});
    return result;
  };
  const repository = createLocalPetRepository(() => storage, lock);
  return {
    storage,
    repository,
    setTime: (value: number) => {
      clock = value;
    },
    store: () =>
      createPetStore(
        repository,
        () => ++clock,
        () => `pet-${++sequence}`,
      ),
    blockRead: (value: boolean) => {
      readFailure = value;
    },
    blockWrite: (value: boolean) => {
      writeFailure = value;
    },
  };
}

describe("돌봄 로컬 저장", () => {
  it.each([false, true])(
    "복원 알림 전 재시도도 삭제/교체된 옛 미저장 돌봄을 폐기: %s",
    async (replace) => {
      const f = fixture(),
        a = f.store(),
        b = f.store();
      await a.getState().hydrate();
      await a.getState().meet();
      f.blockWrite(true);
      await a.getState().recordPat();
      await a.getState().recordSnack();
      f.blockWrite(false);
      await b.getState().hydrate();
      await b.getState().clear();
      if (replace) await b.getState().meet();
      const expected = await f.repository.load();
      await a.getState().retry();
      await a.getState().retry();
      expect(await f.repository.load()).toEqual(expected);
      expect(a.getState()).toMatchObject({
        pet: expected,
        pendingPats: 0,
        pendingSnacks: 0,
        retryOperation: null,
        issue: null,
      });
    },
  );

  it.each([false, true])(
    "초기화 이후 새 입력은 옛 미저장 기록을 제외하고 한 번만 합산: %s",
    async (replace) => {
      const f = fixture(),
        a = f.store(),
        b = f.store();
      await a.getState().hydrate();
      await a.getState().meet();
      f.blockWrite(true);
      await a.getState().recordPat();
      await a.getState().recordSnack();
      f.blockWrite(false);
      await b.getState().hydrate();
      await b.getState().clear();
      if (replace) await b.getState().meet();
      await a.getState().recordSnack();
      await a.getState().retry();
      expect(await f.repository.load()).toMatchObject({
        totalPats: 0,
        totalSnacks: 1,
        affinity: { points: 3 },
      });
    },
  );

  it("최초 읽기 실패 후 다른 ID를 복원해도 미저장 쓰담을 한 번 합산", async () => {
    const f = fixture(),
      a = f.store(),
      b = f.store();
    await a.getState().hydrate();
    await a.getState().meet();
    await a.getState().recordPat();
    const original = a.getState().pet!;
    f.blockRead(true);
    await b.getState().hydrate();
    await b.getState().meet();
    await b.getState().recordPat();
    f.blockRead(false);
    await a.getState().recordPat();
    await b.getState().hydrate();
    await b.getState().hydrate();
    expect(b.getState()).toMatchObject({
      pendingPats: 1,
      pet: { id: original.id, createdAt: original.createdAt, totalPats: 3 },
    });
    await b.getState().retry();
    await b.getState().retry();
    expect((await f.repository.load())!.totalPats).toBe(3);
  });

  it("삭제 실패 후 새 저장을 재시도하면 삭제가 아닌 저장을 수행", async () => {
    const f = fixture(),
      store = f.store();
    await store.getState().hydrate();
    await store.getState().meet();
    await store.getState().recordPat();
    f.blockWrite(true);
    await store.getState().clear();
    f.blockWrite(false);
    await store.getState().recordPat();
    expect(store.getState().pet!.totalPats).toBe(2);
    f.blockWrite(true);
    await store.getState().recordPat();
    f.blockWrite(false);
    await store.getState().retry();
    expect((await f.repository.load())?.totalPats).toBe(3);
  });

  it("최초 저장 실패 후 빈 저장소를 다시 읽어도 미저장 쓰담 유지", async () => {
    const f = fixture(),
      store = f.store();
    await store.getState().hydrate();
    f.blockWrite(true);
    await store.getState().meet();
    await store.getState().recordPat();
    await store.getState().hydrate();
    expect(store.getState()).toMatchObject({
      pendingPats: 1,
      retryOperation: "save",
      issue: "save",
      pet: { totalPats: 1 },
    });
    f.blockWrite(false);
    await store.getState().retry();
    expect((await f.repository.load())!.totalPats).toBe(1);
  });

  it("삭제 실패 중 다른 탭을 복원해도 삭제 재시도 상태 유지", async () => {
    const f = fixture(),
      a = f.store(),
      b = f.store();
    await a.getState().hydrate();
    await a.getState().meet();
    f.blockWrite(true);
    await a.getState().clear();
    f.blockWrite(false);
    await b.getState().hydrate();
    await b.getState().recordPat();
    await a.getState().hydrate();
    expect(a.getState()).toMatchObject({
      retryOperation: "clear",
      issue: "save",
    });
    await a.getState().retry();
    expect(await f.repository.load()).toBeNull();
  });

  it.each([false, true])(
    "확인한 기록이 다른 탭에서 삭제/교체되면 미저장 옛 쓰담을 폐기: %s",
    async (replace) => {
      const f = fixture(),
        a = f.store(),
        b = f.store();
      await a.getState().hydrate();
      await a.getState().meet();
      f.blockWrite(true);
      await a.getState().recordPat();
      f.blockWrite(false);
      await b.getState().hydrate();
      await b.getState().clear();
      if (replace) await b.getState().recordPat();
      await a.getState().hydrate();
      await a.getState().retry();
      expect(a.getState()).toMatchObject({
        pendingPats: 0,
        issue: null,
        retryOperation: null,
      });
      expect(await f.repository.load()).toEqual(b.getState().pet);
    },
  );

  it("불러오기 전 입력은 저장하지 않고 첫 방문에 기록을 생성", async () => {
    const f = fixture(),
      store = f.store();
    await store.getState().recordPat();
    await store.getState().meet();
    expect(f.storage.length).toBe(0);
    await store.getState().hydrate();
    await store.getState().meet();
    expect(store.getState().pet).toMatchObject({
      id: "pet-1",
      totalPats: 0,
      lastPettedAt: null,
    });
    expect(await f.repository.load()).toEqual(store.getState().pet);
  });

  it("새 store에서 ID·첫 만남·누적 횟수를 복원하며 일시 상태는 저장하지 않음", async () => {
    const f = fixture(),
      first = f.store();
    await first.getState().hydrate();
    await first.getState().meet();
    const created = first.getState().pet!;
    await first.getState().recordPat();
    await first.getState().recordPat();
    const second = f.store();
    await second.getState().hydrate();
    expect(second.getState().pet).toMatchObject({
      id: created.id,
      createdAt: created.createdAt,
      totalPats: 2,
    });
    expect(
      Object.keys(
        JSON.parse(f.storage.getItem(STORAGE_KEYS.pet)!).state.pet,
      ).sort(),
    ).toEqual([
      "affinity",
      "createdAt",
      "id",
      "lastPettedAt",
      "totalPats",
      "totalSnacks",
      "updatedAt",
    ]);
    expect(second.getState().pet!.lastPettedAt).toBe(
      second.getState().pet!.updatedAt,
    );
  });

  it("깨우기·연속 입력·재생은 기록을 늘리거나 지우지 않고 인정된 쓰담만 저장", async () => {
    const f = fixture(),
      saved = f.store();
    await saved.getState().hydrate();
    await saved.getState().meet();
    const pending: Promise<void>[] = [];
    const care = createPetCareStore(
      () => {
        pending.push(saved.getState().recordPat());
      },
      () => {
        pending.push(saved.getState().recordSnack());
      },
    );
    const send = care.getState().dispatch;
    send({ type: "start", now: 0 });
    send({ type: "feed", now: 5 }); // sleeping: no reward
    send({ type: "pet", now: 10 }); // wake only
    send({ type: "pet", now: 500 }); // startled
    send({ type: "feed", now: 500 }); // startled: no reward
    send({ type: "advanceIntro", now: 1010 });
    send({ type: "pet", now: 1020 });
    send({ type: "pet", now: 1030 }); // cooldown
    send({ type: "reset" });
    send({ type: "start", now: 2000 });
    await Promise.all(pending);
    expect(pending).toHaveLength(1);
    expect(saved.getState().pet!.totalPats).toBe(1);
    expect(saved.getState().pet!.affinity.points).toBe(2);
    expect(care.getState().state.phase).toBe("sleeping");
    expect((await f.repository.load())!.totalPats).toBe(1);
  });

  it("두 탭이 동시에 처음 만나거나 쓰다듬어도 같은 ID에 횟수를 합산", async () => {
    const f = fixture(),
      a = f.store(),
      b = f.store();
    await Promise.all([a.getState().hydrate(), b.getState().hydrate()]);
    await Promise.all([a.getState().meet(), b.getState().meet()]);
    expect(a.getState().pet!.id).toBe(b.getState().pet!.id);
    await Promise.all([
      a.getState().recordPat(),
      b.getState().recordPat(),
      a.getState().recordPat(),
    ]);
    await b.getState().hydrate();
    expect(b.getState().pet!.totalPats).toBe(3);
    expect((await f.repository.load())!.totalPats).toBe(3);
  });

  it("저장 실패도 메모리에 유지하고 다른 탭의 쓰담에 미저장 횟수를 더해 재시도", async () => {
    const f = fixture(),
      a = f.store();
    await a.getState().hydrate();
    await a.getState().meet();
    f.blockWrite(true);
    await a.getState().recordPat();
    await a.getState().recordPat();
    expect(a.getState()).toMatchObject({
      issue: "save",
      pendingPats: 2,
      pet: { totalPats: 2 },
    });
    f.blockWrite(false);
    const b = f.store();
    await b.getState().hydrate();
    await b.getState().recordPat();
    await a.getState().hydrate();
    expect(a.getState().pet!.totalPats).toBe(3);
    await a.getState().retry();
    await a.getState().retry();
    expect(a.getState()).toMatchObject({ issue: null, pendingPats: 0 });
    expect((await f.repository.load())!.totalPats).toBe(3);
  });

  it("읽기 제한이 있어도 초기 로딩이 끝나며 기록은 메모리에 유지", async () => {
    const f = fixture(),
      store = f.store();
    f.blockRead(true);
    await store.getState().hydrate();
    await store.getState().meet();
    await store.getState().recordPat();
    expect(store.getState()).toMatchObject({
      hydrated: true,
      issue: "load",
      pet: { totalPats: 1 },
    });
    f.blockRead(false);
    await store.getState().retry();
    expect((await f.repository.load())!.totalPats).toBe(1);
  });

  it.each([
    ['{"version":99}', "newer"],
    ["broken-json", "invalid"],
    ['{"version":1,"state":"invalid"}', "invalid"],
  ])("손상/미래 버전은 덮어쓰지 않음: %s", async (raw, issue) => {
    const f = fixture(),
      store = f.store();
    f.storage.setItem(STORAGE_KEYS.pet, raw);
    await store.getState().hydrate();
    await store.getState().meet();
    await store.getState().recordPat();
    expect(store.getState().issue).toBe(issue);
    expect(f.storage.getItem(STORAGE_KEYS.pet)).toBe(raw);
  });

  it("전체 초기화와 다른 탭의 삭제가 이전 기록을 되살리지 않음", async () => {
    const f = fixture(),
      a = f.store(),
      b = f.store();
    await a.getState().hydrate();
    await a.getState().meet();
    await a.getState().recordPat();
    await b.getState().hydrate();
    const previousId = b.getState().pet!.id;
    await a.getState().clear();
    expect(await f.repository.load()).toBeNull();
    // b has not received the storage event yet.
    await b.getState().recordPat();
    expect(b.getState().pet!.id).not.toBe(previousId);
    expect(b.getState().pet!.totalPats).toBe(1);
    await b.getState().clear();
    await a.getState().hydrate();
    expect(a.getState().pet).toBeNull();
  });

  it("음수·비정상 횟수는 유효한 기록으로 읽지 않음", () => {
    expect(() =>
      decodePet(
        JSON.stringify({
          version: 1,
          state: {
            pet: {
              id: "a",
              createdAt: 1,
              updatedAt: 1,
              lastPettedAt: null,
              totalPats: -1,
            },
          },
        }),
      ),
    ).toThrow(PetStorageError);
  });

  it("초기화 실패의 재시도는 옛 기록 저장이 아니라 삭제를 다시 수행", async () => {
    const f = fixture(),
      store = f.store();
    await store.getState().hydrate();
    await store.getState().meet();
    await store.getState().recordPat();
    f.blockWrite(true);
    await store.getState().clear();
    expect(store.getState().issue).toBe("save");
    f.blockWrite(false);
    await store.getState().retry();
    expect(await f.repository.load()).toBeNull();
    expect(store.getState()).toMatchObject({
      pet: null,
      pendingPats: 0,
      issue: null,
    });
  });
});

describe("친밀도 저장과 재시도", () => {
  it.each([false, true])(
    "초기화 확인 뒤 새 입력 저장도 실패하면 새 입력만 재시도: %s",
    async (replace) => {
      const f = fixture(),
        a = f.store(),
        b = f.store();
      await a.getState().hydrate();
      await a.getState().meet();
      f.blockWrite(true);
      await a.getState().recordPat();
      await a.getState().recordSnack();
      f.blockWrite(false);
      await b.getState().hydrate();
      await b.getState().clear();
      if (replace) await b.getState().meet();
      f.blockWrite(true);
      await a.getState().recordSnack();
      expect(a.getState()).toMatchObject({
        pendingPats: 0,
        pendingSnacks: 1,
        pet: { totalPats: 0, totalSnacks: 1, affinity: { points: 3 } },
      });
      await a.getState().hydrate();
      f.blockWrite(false);
      await a.getState().retry();
      await a.getState().retry();
      expect(await f.repository.load()).toMatchObject({
        totalPats: 0,
        totalSnacks: 1,
        affinity: { points: 3 },
      });
      expect(a.getState()).toMatchObject({
        pendingPats: 0,
        pendingSnacks: 0,
        issue: null,
      });
    },
  );

  it("간식은 쓰담 한도 이후에도 두 탭에서 제한 없이 +3, 재방문에도 유지", async () => {
    const f = fixture(),
      a = f.store(),
      b = f.store();
    await a.getState().hydrate();
    await a.getState().meet();
    await b.getState().hydrate();
    await Promise.all(
      Array.from({ length: 7 }, () => a.getState().recordPat()),
    );
    const lastPat = a.getState().pet!.lastPettedAt;
    await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        (i % 2 ? a : b).getState().recordSnack(),
      ),
    );
    const reopened = f.store();
    await reopened.getState().hydrate();
    expect(reopened.getState().pet).toMatchObject({
      totalPats: 7,
      totalSnacks: 20,
      lastPettedAt: lastPat,
      affinity: { points: 70 },
    });
  });

  it("실패한 간식·쓰담을 복원하고 재시도해도 한 번만 적립", async () => {
    const f = fixture(),
      a = f.store(),
      b = f.store();
    await a.getState().hydrate();
    await a.getState().meet();
    f.blockWrite(true);
    await a.getState().recordSnack();
    await a.getState().recordPat();
    await a.getState().recordSnack();
    expect(a.getState()).toMatchObject({
      pendingPats: 1,
      pendingSnacks: 2,
      pet: { affinity: { points: 8 } },
    });
    f.blockWrite(false);
    await b.getState().hydrate();
    await b.getState().recordSnack();
    await a.getState().hydrate();
    await a.getState().hydrate();
    await a.getState().retry();
    await a.getState().retry();
    expect(await f.repository.load()).toMatchObject({
      totalPats: 1,
      totalSnacks: 3,
      affinity: { points: 11 },
    });
    expect(a.getState()).toMatchObject({
      pendingPats: 0,
      pendingSnacks: 0,
      issue: null,
    });
    await a.getState().clear();
    await a.getState().meet();
    expect(a.getState().pet).toMatchObject({
      totalSnacks: 0,
      affinity: { points: 0 },
    });
  });

  it("돌봄 반응 중 입력은 적립하지 않고 종료 후 다음 행동만 저장", async () => {
    const f = fixture(),
      saved = f.store();
    await saved.getState().hydrate();
    await saved.getState().meet();
    const writes: Promise<void>[] = [];
    const care = createPetCareStore(
      () => {
        writes.push(saved.getState().recordPat());
      },
      () => {
        writes.push(saved.getState().recordSnack());
      },
    );
    const send = care.getState().dispatch;
    send({ type: "start", now: 0 });
    send({ type: "feed", now: 1 });
    send({ type: "advanceIntro", now: 5000 });
    send({ type: "feed", now: 5001 });
    send({ type: "feed", now: 5002 });
    send({ type: "pet", now: 5003 });
    send({ type: "feed", now: 6801 });
    send({ type: "pet", now: 8601 });
    send({ type: "feed", now: 8602 });
    send({ type: "pet", now: 8603 });
    send({ type: "reset" });
    await Promise.all(writes);
    expect(writes).toHaveLength(3);
    expect(saved.getState().pet).toMatchObject({
      totalPats: 1,
      totalSnacks: 2,
      affinity: { points: 8 },
    });
  });

  it("저장 대기 중 자정이 지나도 입력한 날짜에 적립", async () => {
    const f = fixture(),
      store = f.store();
    f.setTime(new Date(2026, 10, 11, 23, 59, 59).getTime());
    await store.getState().hydrate();
    await store.getState().meet();
    const yesterday = store.getState().recordPat();
    f.setTime(new Date(2026, 10, 12, 0, 0, 1).getTime());
    const today = store.getState().recordPat();
    await Promise.all([yesterday, today]);
    expect(store.getState().pet!.affinity).toEqual({
      points: 4,
      rewardedPats: { "2026-11-11": 1, "2026-11-12": 1 },
    });
  });

  it("동시 두 탭의 쓰담은 합산하되 친밀도는 하루 10점까지만 저장", async () => {
    const f = fixture(),
      a = f.store(),
      b = f.store();
    await a.getState().hydrate();
    await a.getState().meet();
    await b.getState().hydrate();
    await Promise.all(
      Array.from({ length: 12 }, (_, i) =>
        (i % 2 ? a : b).getState().recordPat(),
      ),
    );
    await a.getState().hydrate();
    await b.getState().hydrate();
    expect(a.getState().pet).toEqual(b.getState().pet);
    expect(a.getState().pet).toMatchObject({
      totalPats: 12,
      affinity: { points: 10 },
    });
    const reopened = f.store();
    await reopened.getState().hydrate();
    await reopened.getState().recordPat();
    expect(reopened.getState().pet).toMatchObject({
      totalPats: 13,
      affinity: { points: 10 },
    });
  });

  it("날짜별 미저장 쓰담을 최신 원본에 적용해 복원·재시도에서도 중복 적립하지 않음", async () => {
    const f = fixture(),
      a = f.store(),
      b = f.store();
    f.setTime(new Date(2026, 10, 11, 12).getTime());
    await a.getState().hydrate();
    await a.getState().meet();
    await Promise.all(
      Array.from({ length: 3 }, () => a.getState().recordPat()),
    );
    f.blockWrite(true);
    await a.getState().recordPat();
    await a.getState().recordPat();
    f.setTime(new Date(2026, 10, 12, 12).getTime());
    await a.getState().recordPat();
    f.blockWrite(false);
    await b.getState().hydrate();
    await b.getState().recordPat();
    await a.getState().hydrate();
    await a.getState().hydrate();
    expect(a.getState().pet!.affinity.points).toBe(14);
    await a.getState().retry();
    await a.getState().retry();
    expect((await f.repository.load())!.affinity).toEqual({
      points: 14,
      rewardedPats: { "2026-11-11": 5, "2026-11-12": 2 },
    });
    expect((await f.repository.load())!.totalPats).toBe(7);
    expect(JSON.parse(f.storage.getItem(STORAGE_KEYS.pet)!).version).toBe(3);
  });

  it("최초 저장 실패 시 임시 친밀도를 중복 저장하지 않음", async () => {
    const f = fixture(),
      a = f.store();
    await a.getState().hydrate();
    f.blockWrite(true);
    await a.getState().meet();
    await a.getState().recordPat();
    await a.getState().hydrate();
    await a.getState().hydrate();
    f.blockWrite(false);
    await a.getState().retry();
    expect((await f.repository.load())!.affinity.points).toBe(2);
  });

  it("전체 초기화 후 친밀도와 하루 한도를 새 기록으로 시작", async () => {
    const f = fixture(),
      a = f.store();
    await a.getState().hydrate();
    await a.getState().meet();
    await a.getState().recordPat();
    await a.getState().clear();
    await a.getState().meet();
    expect(a.getState().pet!.affinity).toEqual({ points: 0, rewardedPats: {} });
  });
});
