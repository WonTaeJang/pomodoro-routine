import { isFocusSoundSetting } from "@/features/focus-sound/sounds";
import { SETTING_RANGES } from "@/features/timer/timer";
import type { TimerSettings } from "@/features/timer/types";
import { isUuid } from "./rowValues";

/** 기기끼리 맞추는 설정 (나머지 설정·테마·언어는 브라우저에만) */
export const SYNCED_SETTING_KEYS = [
  "focusMinutes",
  "shortBreakMinutes",
  "longBreakMinutes",
  "longBreakInterval",
  "autoStartBreaks",
  "autoStartFocus",
  "focusSound",
  "certificateShowTasks",
] as const;

type SyncedSettingKey = (typeof SYNCED_SETTING_KEYS)[number];

/** 계정에 저장하는 설정: 위 설정들 + 지금 집중할 할 일 */
export type SyncedSettings = Pick<TimerSettings, SyncedSettingKey> & {
  activeTaskId: string | null;
};

/** 서버 `user_settings` 표의 한 줄에서 쓰는 열 */
export type SettingsRow = {
  settings: unknown;
  active_task_id: string | null;
};

/** 설정에서 기기끼리 맞추는 항목만 */
function pickKeys(settings: Pick<TimerSettings, SyncedSettingKey>) {
  return Object.fromEntries(
    SYNCED_SETTING_KEYS.map((key) => [key, settings[key]]),
  ) as Pick<TimerSettings, SyncedSettingKey>;
}

export function pickSyncedSettings(
  settings: TimerSettings,
  activeTaskId: string | null,
): SyncedSettings {
  return { ...pickKeys(settings), activeTaskId };
}

/** 설정의 "모양": 정해진 순서로 담은 문자열. 서버와 같다고 확인한 모양과 비교해 바뀌었는지 가림 */
export function settingsShape(settings: SyncedSettings): string {
  return JSON.stringify([
    ...SYNCED_SETTING_KEYS.map((key) => settings[key]),
    settings.activeTaskId,
  ]);
}

/** 서버에 올릴 settings 열 (지금 집중할 할 일은 따로 active_task_id 열) */
export function toSettingsJson(settings: SyncedSettings) {
  return pickKeys(settings);
}

const inRange = (value: unknown, range: { min: number; max: number }) =>
  Number.isInteger(value) &&
  (value as number) >= range.min &&
  (value as number) <= range.max;

/** 항목별로 받을 수 있는 값인지 (다른 버전 앱이 저장했거나 손으로 고친 값을 거름) */
const VALID: Record<SyncedSettingKey, (value: unknown) => boolean> = {
  focusMinutes: (v) => inRange(v, SETTING_RANGES.focusMinutes),
  shortBreakMinutes: (v) => inRange(v, SETTING_RANGES.shortBreakMinutes),
  longBreakMinutes: (v) => inRange(v, SETTING_RANGES.longBreakMinutes),
  longBreakInterval: (v) => inRange(v, SETTING_RANGES.longBreakInterval),
  autoStartBreaks: (v) => typeof v === "boolean",
  autoStartFocus: (v) => typeof v === "boolean",
  focusSound: (v) => isFocusSoundSetting(v),
  certificateShowTasks: (v) => typeof v === "boolean",
};

/**
 * 서버에서 받은 설정을 읽습니다. 받을 수 없는 값이나 없는 항목은 fallback(지금 이 브라우저 값)을 씀
 */
export function fromSettingsRow(
  row: SettingsRow,
  fallback: SyncedSettings,
): SyncedSettings {
  const saved =
    row.settings && typeof row.settings === "object"
      ? (row.settings as Record<string, unknown>)
      : {};
  const settings = { ...fallback };
  for (const key of SYNCED_SETTING_KEYS) {
    if (VALID[key](saved[key])) {
      (settings as Record<string, unknown>)[key] = saved[key];
    }
  }
  settings.activeTaskId = isUuid(row.active_task_id)
    ? row.active_task_id
    : null;
  return settings;
}
