import { describe, expect, it, vi } from "vitest";
import { newSessions, sessionKey } from "@/features/history/sessions";
import type { CompletedSession } from "@/features/timer/types";
import { createSessionSync } from "./sessionSync";

const focus = (endedAt: number): CompletedSession => ({
  mode: "focus",
  endedAt,
  durationMs: 1500000,
});

/** 가짜 서버와 가짜 브라우저 기록 */
function setup(
  remoteStart: CompletedSession[],
  localStart: CompletedSession[],
) {
  const remote = [...remoteStart];
  let local = [...localStart];
  let offline = false;
  const fetchAll = vi.fn(async () => {
    if (offline) throw new Error("offline");
    return [...remote];
  });
  const upload = vi.fn(async (sessions: CompletedSession[]) => {
    if (offline) throw new Error("offline");
    remote.push(...newSessions(remote, sessions));
  });
  const { sync, stop } = createSessionSync({
    fetchAll,
    upload,
    getLocal: () => local,
    mergeLocal: (sessions) => {
      local = [...local, ...newSessions(local, sessions)];
    },
  });
  return {
    sync,
    stop,
    fetchAll,
    upload,
    keys: () => ({
      remote: remote.map(sessionKey).sort(),
      local: local.map(sessionKey).sort(),
    }),
    addLocal: (session: CompletedSession) => {
      local = [...local, session];
    },
    addRemote: (session: CompletedSession) => remote.push(session),
    setOffline: (value: boolean) => {
      offline = value;
    },
  };
}

describe("createSessionSync", () => {
  it("처음 맞추면 서버 기록을 받고, 브라우저에만 있는 기록을 올림", async () => {
    const t = setup([focus(1), focus(2)], [focus(2), focus(3)]);
    expect(await t.sync()).toBe(true);
    const { remote, local } = t.keys();
    expect(remote).toEqual(["focus:1", "focus:2", "focus:3"]);
    expect(local).toEqual(remote);
    // 서버에 이미 있는 focus:2는 다시 올리지 않음
    expect(t.upload).toHaveBeenCalledWith([focus(3)]);
  });

  it("새 기록이 생기면 그것만 올리고, 서버 기록을 다시 받지 않음", async () => {
    const t = setup([], [focus(1)]);
    await t.sync();
    t.addLocal(focus(2));
    await t.sync();
    expect(t.fetchAll).toHaveBeenCalledTimes(1);
    expect(t.upload).toHaveBeenLastCalledWith([focus(2)]);
    // 올릴 것이 없으면 서버에 요청하지 않음
    await t.sync();
    expect(t.upload).toHaveBeenCalledTimes(2);
  });

  it("인터넷이 끊기면 false, 다시 연결되면 못 올린 것을 올림", async () => {
    const t = setup([], [focus(1)]);
    t.setOffline(true);
    expect(await t.sync()).toBe(false);
    t.addLocal(focus(2));
    expect(await t.sync()).toBe(false);
    expect(t.keys().remote).toEqual([]);

    t.setOffline(false);
    expect(await t.sync()).toBe(true);
    expect(t.keys().remote).toEqual(["focus:1", "focus:2"]);
  });

  it("refresh면 다른 기기에서 쌓인 기록을 받아옴", async () => {
    const t = setup([], [focus(1)]);
    await t.sync();
    t.addRemote(focus(5));
    await t.sync();
    expect(t.keys().local).toEqual(["focus:1"]);
    await t.sync({ refresh: true });
    expect(t.keys().local).toEqual(["focus:1", "focus:5"]);
    // 받아온 기록을 다시 올리지 않음
    expect(t.upload).toHaveBeenCalledTimes(1);
  });

  it("맞추는 중에 생긴 기록은 끝난 뒤 이어서 올림 (같은 것을 두 번 올리지 않음)", async () => {
    const t = setup([], [focus(1)]);
    const first = t.sync();
    t.addLocal(focus(2));
    void t.sync();
    await first;
    await vi.waitFor(() =>
      expect(t.keys().remote).toEqual(["focus:1", "focus:2"]),
    );
    expect(t.upload.mock.calls.flat(2).map(sessionKey).sort()).toEqual([
      "focus:1",
      "focus:2",
    ]);
  });

  it("그만둔 뒤에 도착한 서버 기록은 합치지 않고, 올리지도 않음 (계정을 바꿨을 때)", async () => {
    const t = setup([focus(1)], [focus(2)]);
    const pending = t.sync();
    t.stop();
    expect(await pending).toBe(false);
    expect(t.keys().local).toEqual(["focus:2"]);
    expect(t.upload).not.toHaveBeenCalled();
    expect(await t.sync()).toBe(false);
    expect(t.fetchAll).toHaveBeenCalledTimes(1);
  });
});
