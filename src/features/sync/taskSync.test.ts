import { describe, expect, it, vi } from "vitest";
import type { Task } from "@/features/tasks/types";
import type { TaskMemory } from "./memory";
import {
  fromTaskRow,
  toTaskRow,
  type RemoteTaskRow,
  type TaskRow,
} from "./taskRows";
import { createTaskSync } from "./taskSync";

const USER = "11111111-1111-4111-8111-111111111111";
const id = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const task = (n: number, patch: Partial<Task> = {}): Task => ({
  id: id(n),
  title: `할 일 ${n}`,
  estimate: 2,
  completedPomodoros: 0,
  done: false,
  order: n,
  createdAt: 1_000 + n,
  completedAt: null,
  archivedAt: null,
  ...patch,
});

/** 가짜 서버(고친 시각을 차례로 찍음)와 가짜 브라우저 */
function setup(local: Task[] = []) {
  const server = new Map<string, RemoteTaskRow>();
  let clock = 0;
  const stamp = () =>
    new Date(Date.UTC(2026, 10, 12, 0, 0, ++clock)).toISOString();
  const serverPut = (t: Task, deleted = false) => {
    const row: Partial<TaskRow> = { ...toTaskRow(t, USER)! };
    delete row.user_id;
    server.set(t.id, {
      ...(row as Omit<TaskRow, "user_id">),
      deleted_at: deleted ? "2026-11-12T09:00:00.000Z" : null,
      updated_at: stamp(),
    });
  };
  let tasks = [...local];
  let memory: TaskMemory = { cursor: null, baseline: {} };
  let offline = false;
  const fetchSince = vi.fn(async (since: string | null) => {
    if (offline) throw new Error("offline");
    return [...server.values()]
      .filter((row) => !since || row.updated_at >= since)
      .sort((a, b) => a.updated_at.localeCompare(b.updated_at));
  });
  const upload = vi.fn(async (rows: TaskRow[]) => {
    if (offline) throw new Error("offline");
    rows.forEach((row) => serverPut(fromTaskRow({ ...row, updated_at: "" })!));
  });
  const markDeleted = vi.fn(async (ids: string[]) => {
    if (offline) throw new Error("offline");
    for (const key of ids) {
      const row = server.get(key);
      if (row)
        server.set(key, { ...row, deleted_at: "x", updated_at: stamp() });
    }
  });
  const sync = createTaskSync({
    fetchSince,
    toRow: (t) => (t.title === "올리지 못함" ? null : toTaskRow(t, USER)),
    upload,
    markDeleted,
    getLocal: () => tasks,
    setLocal: (list) => {
      tasks = list;
    },
    readMemory: () => structuredClone(memory),
    writeMemory: (next) => {
      memory = next;
    },
  });
  return {
    ...sync,
    server,
    serverPut,
    upload,
    markDeleted,
    fetchSince,
    local: () => tasks,
    setLocal: (list: Task[]) => {
      tasks = list;
    },
    memory: () => memory,
    setOffline: (value: boolean) => {
      offline = value;
    },
    serverTitles: () =>
      [...server.values()]
        .filter((row) => row.deleted_at === null)
        .map((row) => row.title)
        .sort(),
    localTitles: () => tasks.map((t) => t.title).sort(),
  };
}

describe("createTaskSync", () => {
  it("처음 맞추면 서버 할 일을 받고, 이 브라우저에만 있는 할 일을 올림", async () => {
    const t = setup([task(1)]);
    t.serverPut(task(2));
    expect(await t.sync()).toBe(true);
    expect(t.localTitles()).toEqual(["할 일 1", "할 일 2"]);
    expect(t.serverTitles()).toEqual(["할 일 1", "할 일 2"]);
    expect(t.upload).toHaveBeenCalledWith([toTaskRow(task(1), USER)]);
  });

  it("고친 할 일만 올리고, 바뀐 게 없으면 서버에 요청하지 않음", async () => {
    const t = setup([task(1), task(2)]);
    await t.sync();
    t.upload.mockClear();
    t.setLocal([task(1, { title: "고친 제목" }), task(2)]);
    await t.sync();
    expect(t.upload).toHaveBeenCalledWith([
      toTaskRow(task(1, { title: "고친 제목" }), USER),
    ]);
    await t.sync();
    expect(t.upload).toHaveBeenCalledTimes(1);
  });

  it("이 브라우저에서 지운 할 일은 서버에 지운 표시만 함", async () => {
    const t = setup([task(1), task(2)]);
    await t.sync();
    t.setLocal([task(2)]);
    await t.sync();
    expect(t.markDeleted).toHaveBeenCalledWith([id(1)]);
    expect(t.server.get(id(1))?.deleted_at).not.toBeNull();
    expect(t.memory().baseline[id(1)]).toBeUndefined();
  });

  it("다른 기기에서 고치거나 지운 할 일을 받아 반영 (refresh)", async () => {
    const t = setup([task(1), task(2)]);
    await t.sync();
    t.serverPut(task(1, { title: "다른 기기에서 고침" }));
    t.serverPut(task(2), true);
    t.serverPut(task(3));
    await t.sync({ refresh: true });
    expect(t.localTitles()).toEqual(["다른 기기에서 고침", "할 일 3"]);
    // 받은 것을 다시 올리지 않음
    expect(t.upload).toHaveBeenCalledTimes(1);
    expect(t.markDeleted).not.toHaveBeenCalled();
  });

  it("같은 할 일을 양쪽에서 고쳤으면 이 브라우저 쪽을 올림", async () => {
    const t = setup([task(1)]);
    await t.sync();
    t.serverPut(task(1, { title: "다른 기기" }));
    t.setLocal([task(1, { title: "이 기기" })]);
    await t.sync({ refresh: true });
    expect(t.localTitles()).toEqual(["이 기기"]);
    expect(t.serverTitles()).toEqual(["이 기기"]);
  });

  it("다른 기기에서 지운 할 일을 이 브라우저에서 고쳤으면 되살림", async () => {
    const t = setup([task(1)]);
    await t.sync();
    t.serverPut(task(1), true);
    t.setLocal([task(1, { estimate: 5 })]);
    await t.sync({ refresh: true });
    expect(t.local()).toEqual([task(1, { estimate: 5 })]);
    expect(t.server.get(id(1))?.deleted_at).toBeNull();
  });

  it("두 번째부터는 마지막으로 받은 시각 조금 앞부터만 받음", async () => {
    const t = setup();
    t.serverPut(task(1));
    await t.sync();
    const cursor = t.memory().cursor!;
    await t.sync({ refresh: true });
    const since = t.fetchSince.mock.calls[1][0]!;
    expect(Date.parse(cursor) - Date.parse(since)).toBe(60_000);
  });

  it("인터넷이 끊기면 false, 다시 연결되면 못 올린 것을 올림 (지운 것 포함)", async () => {
    const t = setup([task(1), task(2)]);
    await t.sync();
    t.setOffline(true);
    t.setLocal([task(1, { done: true })]);
    expect(await t.sync()).toBe(false);
    t.setOffline(false);
    expect(await t.sync()).toBe(true);
    expect(t.server.get(id(1))?.done).toBe(true);
    expect(t.server.get(id(2))?.deleted_at).not.toBeNull();
  });

  it("그만둔 뒤 도착한 응답은 반영하지 않고 기억도 바꾸지 않음", async () => {
    const t = setup([task(1)]);
    t.serverPut(task(2));
    const pending = t.sync();
    t.stop();
    expect(await pending).toBe(false);
    expect(t.localTitles()).toEqual(["할 일 1"]);
    expect(t.upload).not.toHaveBeenCalled();
    expect(t.memory()).toEqual({ cursor: null, baseline: {} });
  });

  it("서버 표에 올릴 수 없는 할 일은 이 브라우저에만 두고 올린 것으로 치지 않음", async () => {
    const t = setup([task(1, { title: "올리지 못함" }), task(2)]);
    await t.sync();
    expect(t.upload).toHaveBeenCalledWith([toTaskRow(task(2), USER)]);
    expect(t.memory().baseline[id(1)]).toBeUndefined();
    t.setLocal([task(2)]);
    await t.sync();
    expect(t.markDeleted).not.toHaveBeenCalled();
  });
});
