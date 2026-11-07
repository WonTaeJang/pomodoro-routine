import { beforeEach, describe, expect, it } from "vitest";
import { useTimerStore } from "./store";
import { DEFAULT_SETTINGS, createInitialState } from "./timer";

const MIN = 60_000;

describe("설정 되돌리기, 데이터 초기화", () => {
  beforeEach(() => {
    useTimerStore.getState().resetAll();
    useTimerStore.getState().updateSettings({ testDurationSeconds: null });
  });

  it("설정 되돌리기: 바꾼 설정은 기본값으로, 개발용 테스트 모드는 그대로", () => {
    const store = useTimerStore.getState();
    store.updateSettings({
      focusMinutes: 50,
      soundEnabled: false,
      ringEffects: false,
      testDurationSeconds: 5,
    });
    useTimerStore.getState().resetSettings();

    expect(useTimerStore.getState().settings).toEqual({
      ...DEFAULT_SETTINGS,
      testDurationSeconds: 5,
    });
  });

  it("설정 되돌리기: 시작 전 세션 길이도 기본값에 맞춤", () => {
    useTimerStore.getState().updateSettings({ focusMinutes: 50 });
    expect(useTimerStore.getState().timer.durationMs).toBe(50 * MIN);

    useTimerStore.getState().resetSettings();
    expect(useTimerStore.getState().timer.durationMs).toBe(25 * MIN);
  });

  it("데이터 초기화: 진행 중이던 타이머와 사이클도 처음으로", () => {
    const store = useTimerStore.getState();
    store.updateSettings({ focusMinutes: 50 });
    store.start();
    expect(useTimerStore.getState().timer.status).toBe("running");

    useTimerStore.getState().resetAll();
    const { settings, timer, lastCompleted } = useTimerStore.getState();
    expect(settings.focusMinutes).toBe(25);
    expect(timer).toEqual(createInitialState(DEFAULT_SETTINGS));
    expect(lastCompleted).toBeNull();
  });
});
