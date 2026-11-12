import { describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "@/features/timer/timer";
import {
  fromSettingsRow,
  pickSyncedSettings,
  settingsShape,
  toSettingsJson,
  type SettingsRow,
  type SyncedSettings,
} from "./settingsRows";
import { createSettingsSync } from "./settingsSync";

const TASK = "22222222-2222-4222-8222-222222222222";
const base = pickSyncedSettings(DEFAULT_SETTINGS, null);

function setup(local: SyncedSettings, server: SettingsRow | null = null) {
  let mine = local;
  let row = server;
  let memory: string | null = null;
  const upload = vi.fn(async (value: SyncedSettings) => {
    row = {
      settings: toSettingsJson(value),
      active_task_id: value.activeTaskId,
    };
  });
  const sync = createSettingsSync({
    fetch: async () => row,
    upload,
    getLocal: () => mine,
    setLocal: (value) => {
      mine = value;
    },
    readMemory: () => memory,
    writeMemory: (shape) => {
      memory = shape;
    },
  });
  return {
    ...sync,
    upload,
    local: () => mine,
    setLocal: (value: SyncedSettings) => {
      mine = value;
    },
    row: () => row,
    setRow: (value: SettingsRow) => {
      row = value;
    },
  };
}

describe("fromSettingsRow", () => {
  it("받을 수 없는 값은 이 브라우저 값을 씀", () => {
    const value = fromSettingsRow(
      {
        settings: {
          focusMinutes: 50,
          shortBreakMinutes: 99,
          longBreakInterval: 3.5,
          autoStartBreaks: "yes",
          focusSound: "rain",
          soundVolume: 0.1,
        },
        active_task_id: "not-uuid",
      },
      { ...base, activeTaskId: TASK },
    );
    expect(value).toEqual({
      ...base,
      focusMinutes: 50,
      focusSound: "rain",
      activeTaskId: null,
    });
  });

  it("브라우저에만 두는 설정(소리 크기 등)은 담지 않음", () => {
    expect(Object.keys(toSettingsJson(base))).not.toContain("soundVolume");
    expect(Object.keys(toSettingsJson(base))).not.toContain("activeTaskId");
  });
});

describe("createSettingsSync", () => {
  it("서버에 설정이 없으면 이 브라우저 설정을 올림", async () => {
    const t = setup({ ...base, focusMinutes: 30 });
    expect(await t.sync()).toBe(true);
    expect(t.row()?.settings).toMatchObject({ focusMinutes: 30 });
  });

  it("이 브라우저에서 처음 맞추면 계정 설정을 따름 (새 기기에서 로그인)", async () => {
    const t = setup(base, {
      settings: { ...toSettingsJson(base), focusMinutes: 45 },
      active_task_id: TASK,
    });
    await t.sync();
    expect(t.local()).toEqual({
      ...base,
      focusMinutes: 45,
      activeTaskId: TASK,
    });
    expect(t.upload).not.toHaveBeenCalled();
  });

  it("고치면 올리고, 다른 기기에서 바뀐 것은 refresh 때 받음", async () => {
    const t = setup(base);
    await t.sync();
    t.setLocal({ ...base, autoStartBreaks: true });
    await t.sync();
    expect(t.row()?.settings).toMatchObject({ autoStartBreaks: true });

    t.setRow({
      settings: {
        ...toSettingsJson(base),
        autoStartBreaks: true,
        focusMinutes: 60,
      },
      active_task_id: null,
    });
    await t.sync({ refresh: true });
    expect(t.local().focusMinutes).toBe(60);
    expect(t.upload).toHaveBeenCalledTimes(2);
  });

  it("양쪽에서 고쳤으면 이 브라우저 쪽을 올림", async () => {
    const t = setup(base);
    await t.sync();
    t.setRow({
      settings: { ...toSettingsJson(base), focusMinutes: 60 },
      active_task_id: null,
    });
    t.setLocal({ ...base, focusMinutes: 20 });
    await t.sync({ refresh: true });
    expect(t.local().focusMinutes).toBe(20);
    expect(t.row()?.settings).toMatchObject({ focusMinutes: 20 });
  });

  it("설정 모양은 올리는 항목만 비교함", () => {
    expect(settingsShape(base)).toBe(
      settingsShape(
        pickSyncedSettings({ ...DEFAULT_SETTINGS, soundVolume: 0.1 }, null),
      ),
    );
  });
});
