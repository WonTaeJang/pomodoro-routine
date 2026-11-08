import { describe, expect, it } from "vitest";
import {
  applySettings,
  AUTO_START_DELAY_MS,
  beginAutoStart,
  cancelAutoStart,
  createInitialState,
  DEFAULT_SETTINGS,
  formatRemaining,
  getRemainingMs,
  pause,
  reset,
  skip,
  start,
  switchMode,
  sync,
} from "./timer";
import type { TimerSettings, TimerState } from "./types";

const MIN = 60_000;
const T0 = Date.UTC(2026, 10, 7, 9, 0, 0); // 기준 시각
const settings = DEFAULT_SETTINGS;

/** 집중을 처음부터 끝까지 마친 상태를 만듭니다. */
function finishSession(state: TimerState, s: TimerSettings, at: number) {
  const running = start(state, at);
  return sync(running, s, running.endsAt!);
}

describe("처음 상태", () => {
  it("집중 25분, 시작 전, 완료 0회", () => {
    const state = createInitialState(settings);
    expect(state).toMatchObject({
      mode: "focus",
      status: "idle",
      remainingMs: 25 * MIN,
      completedInCycle: 0,
    });
  });
});

describe("시작과 남은 시간", () => {
  it("끝나는 시각을 기준으로 남은 시간을 계산한다", () => {
    const running = start(createInitialState(settings), T0);
    expect(running.endsAt).toBe(T0 + 25 * MIN);
    expect(getRemainingMs(running, T0 + 10 * MIN)).toBe(15 * MIN);
  });

  it("시간이 지나도 남은 시간은 0 아래로 내려가지 않는다", () => {
    const running = start(createInitialState(settings), T0);
    expect(getRemainingMs(running, T0 + 60 * MIN)).toBe(0);
  });

  it("시작 직후 화면 시계가 조금 늦어도 설정한 시간보다 커지지 않는다", () => {
    const running = start(createInitialState(settings), T0);
    expect(getRemainingMs(running, T0 - 200)).toBe(25 * MIN);
  });

  it("이미 진행 중이면 다시 시작해도 바뀌지 않는다", () => {
    const running = start(createInitialState(settings), T0);
    expect(start(running, T0 + MIN)).toBe(running);
  });
});

describe("일시정지", () => {
  it("일시정지하면 남은 시간이 멈추고, 다시 시작하면 이어진다", () => {
    const running = start(createInitialState(settings), T0);
    const paused = pause(running, T0 + 10 * MIN);
    expect(paused.status).toBe("paused");
    expect(getRemainingMs(paused, T0 + 50 * MIN)).toBe(15 * MIN);

    const resumed = start(paused, T0 + 50 * MIN);
    expect(resumed.endsAt).toBe(T0 + 65 * MIN);
  });
});

describe("완료와 다음 세션", () => {
  it("끝나기 전에는 아무 일도 일어나지 않는다", () => {
    const running = start(createInitialState(settings), T0);
    const result = sync(running, settings, T0 + 24 * MIN);
    expect(result.state).toBe(running);
    expect(result.completed).toEqual([]);
  });

  it("집중이 끝나면 완료로 기록하고 짧은 휴식으로 넘어간다", () => {
    const { state, completed } = finishSession(
      createInitialState(settings),
      settings,
      T0,
    );
    expect(completed).toEqual([
      { mode: "focus", endedAt: T0 + 25 * MIN, durationMs: 25 * MIN },
    ]);
    expect(state).toMatchObject({
      mode: "short-break",
      status: "idle",
      remainingMs: 5 * MIN,
      completedInCycle: 1,
    });
  });

  it("짧은 휴식이 끝나면 집중으로 돌아간다", () => {
    const afterFocus = finishSession(
      createInitialState(settings),
      settings,
      T0,
    ).state;
    const { state } = finishSession(afterFocus, settings, T0 + 30 * MIN);
    expect(state).toMatchObject({ mode: "focus", completedInCycle: 1 });
  });

  it("집중 4번째가 끝나면 긴 휴식, 긴 휴식이 끝나면 사이클이 처음부터 시작된다", () => {
    let state = createInitialState(settings);
    const modes: string[] = [];
    let now = T0;
    for (let i = 0; i < 8; i++) {
      const result = finishSession(state, settings, now);
      state = result.state;
      now = result.completed[0].endedAt;
      modes.push(state.mode);
    }
    expect(modes).toEqual([
      "short-break",
      "focus",
      "short-break",
      "focus",
      "short-break",
      "focus",
      "long-break",
      "focus",
    ]);
    expect(state.completedInCycle).toBe(0);
  });

  it("4번째 집중을 마친 세션에만 사이클 완료 표시가 붙는다", () => {
    let state = createInitialState(settings);
    const flags: boolean[] = [];
    for (let i = 0; i < 8; i++) {
      const result = finishSession(state, settings, T0);
      state = result.state;
      if (result.completed[0].mode === "focus") {
        flags.push(result.completed[0].cycleCompleted === true);
      }
    }
    expect(flags).toEqual([false, false, false, true]);
  });

  it("긴 휴식 주기 설정을 따른다", () => {
    const every2 = { ...settings, longBreakInterval: 2 };
    let state = finishSession(createInitialState(every2), every2, T0).state; // 집중 1
    state = finishSession(state, every2, T0).state; // 짧은 휴식
    state = finishSession(state, every2, T0).state; // 집중 2
    expect(state.mode).toBe("long-break");
  });
});

describe("자동 시작", () => {
  const auto = { ...settings, autoStartBreaks: true, autoStartFocus: true };
  const SEC = 1000;

  /** 집중을 마친 직후 (자동 시작 대기) */
  function afterFocus(s: TimerSettings = auto, completedInCycle = 0) {
    const running = start({ ...createInitialState(s), completedInCycle }, T0);
    return sync(running, s, T0 + 25 * MIN);
  }

  it("세션이 끝나면 다음 세션은 자동 시작 대기가 되고, 시간은 흐르지 않는다", () => {
    const { state } = afterFocus();
    expect(state).toMatchObject({
      mode: "short-break",
      status: "idle",
      autoStart: { at: null },
    });
    // 팝업이 보이기 전에는 아무리 기다려도 시작하지 않음 (다른 탭, 자리 비움)
    expect(sync(state, auto, T0 + 60 * MIN).state.status).toBe("idle");
  });

  it("팝업이 보인 순간부터 5초 뒤에 시작하고, 그 시각을 기준으로 끝나는 시각을 정한다", () => {
    const shownAt = T0 + 25 * MIN + 1 * SEC;
    const counting = beginAutoStart(afterFocus().state, shownAt);
    expect(counting.autoStart).toEqual({ at: shownAt + AUTO_START_DELAY_MS });
    expect(sync(counting, auto, shownAt + 4 * SEC).state.status).toBe("idle");
    // 화면 갱신이 늦게 와도(예: 7초 뒤) 시작 시각은 카운트다운이 끝난 시각
    const { state, completed } = sync(counting, auto, shownAt + 7 * SEC);
    expect(completed).toEqual([]);
    expect(state).toMatchObject({
      status: "running",
      endsAt: shownAt + AUTO_START_DELAY_MS + 5 * MIN,
      autoStart: null,
    });
  });

  it("카운트다운은 한 번만 정해진다 (팝업이 다시 그려져도 늘어나지 않음)", () => {
    const counting = beginAutoStart(afterFocus().state, T0 + 25 * MIN);
    expect(beginAutoStart(counting, T0 + 25 * MIN + 3 * SEC)).toBe(counting);
  });

  it("지금 시작: 기다리지 않고 바로 시작", () => {
    const now = T0 + 25 * MIN + 2 * SEC;
    const state = start(beginAutoStart(afterFocus().state, now), now);
    expect(state).toMatchObject({
      status: "running",
      endsAt: now + 5 * MIN,
      autoStart: null,
    });
  });

  it("취소: 다음 세션은 처음 길이 그대로 시작 전 상태, 자동 시작 설정은 그대로", () => {
    const counting = beginAutoStart(afterFocus().state, T0 + 25 * MIN);
    const cancelled = cancelAutoStart(counting);
    expect(cancelled).toMatchObject({
      status: "idle",
      remainingMs: 5 * MIN,
      autoStart: null,
    });
    expect(sync(cancelled, auto, T0 + 26 * MIN).state.status).toBe("idle");
  });

  it("카운트다운 중 자리를 비워 다음 세션 시간까지 다 지났으면 시작 전 상태로 둔다", () => {
    const counting = beginAutoStart(afterFocus().state, T0 + 25 * MIN);
    const { state, completed } = sync(counting, auto, T0 + 60 * MIN);
    expect(completed).toEqual([]);
    expect(state).toMatchObject({ status: "idle", autoStart: null });
  });

  it("휴식 자동 시작만 켜면 휴식만 대기하고, 집중은 대기 없이 시작 전 상태", () => {
    const breaksOnly = { ...settings, autoStartBreaks: true };
    expect(afterFocus(breaksOnly).state.autoStart).toEqual({ at: null });
    const breakRunning = start(afterFocus(breaksOnly).state, T0 + 25 * MIN);
    const afterBreak = sync(breakRunning, breaksOnly, T0 + 30 * MIN);
    expect(afterBreak.state).toMatchObject({ mode: "focus", status: "idle" });
    expect(afterBreak.state.autoStart ?? null).toBeNull();
  });

  it("사이클을 마치면 자동 시작이 켜져 있어도 긴 휴식은 대기 없이 멈춘다", () => {
    const { state, completed } = afterFocus(auto, 3);
    expect(completed[0].cycleCompleted).toBe(true);
    expect(state).toMatchObject({ mode: "long-break", status: "idle" });
    expect(state.autoStart ?? null).toBeNull();
  });

  it("멈춘 긴 휴식을 직접 시작하면, 끝난 뒤에는 다시 자동 시작을 따른다", () => {
    const longBreak = start(afterFocus(auto, 3).state, T0 + 26 * MIN);
    const { state } = sync(longBreak, auto, T0 + 41 * MIN);
    expect(state).toMatchObject({
      mode: "focus",
      status: "idle",
      completedInCycle: 0,
      autoStart: { at: null },
    });
  });

  it("대기 중에 설정을 바꿔도 대기는 유지된다", () => {
    const { state } = afterFocus();
    expect(
      applySettings(state, { ...auto, shortBreakMinutes: 10 }),
    ).toMatchObject({ remainingMs: 10 * MIN, autoStart: { at: null } });
  });

  it("꺼져 있으면 다음 세션은 시작 전 상태로 기다린다", () => {
    const { state } = finishSession(createInitialState(settings), settings, T0);
    expect(state.status).toBe("idle");
    expect(state.endsAt).toBeNull();
    expect(state.autoStart ?? null).toBeNull();
  });
});

describe("자리를 비운 사이 끝난 경우", () => {
  it("끝난 세션 1개만 완료로 기록한다", () => {
    const auto = { ...settings, autoStartBreaks: true, autoStartFocus: true };
    const running = start(createInitialState(auto), T0);
    const { state, completed } = sync(running, auto, T0 + 5 * 60 * MIN);
    expect(completed).toHaveLength(1);
    expect(state).toMatchObject({
      mode: "short-break",
      status: "idle",
      remainingMs: 5 * MIN,
    });
  });
});

describe("리셋, 건너뛰기, 모드 전환은 완료로 세지 않는다", () => {
  it("리셋하면 지금 모드의 처음으로 돌아간다", () => {
    const paused = pause(
      start(createInitialState(settings), T0),
      T0 + 10 * MIN,
    );
    const state = reset(paused, settings);
    expect(state).toMatchObject({
      mode: "focus",
      status: "idle",
      remainingMs: 25 * MIN,
    });
    expect(state.completedInCycle).toBe(0);
  });

  it("집중을 건너뛰면 휴식으로 가지만 완료 횟수는 그대로다", () => {
    const state = skip(start(createInitialState(settings), T0), settings);
    expect(state).toMatchObject({
      mode: "short-break",
      status: "idle",
      completedInCycle: 0,
    });
  });

  it("긴 휴식을 건너뛰면 사이클이 처음부터 시작된다", () => {
    const longBreak: TimerState = {
      ...switchMode(createInitialState(settings), "long-break", settings),
      completedInCycle: 4,
    };
    expect(skip(longBreak, settings)).toMatchObject({
      mode: "focus",
      completedInCycle: 0,
    });
  });

  it("모드 탭으로 바꾸면 그 모드의 처음 상태가 된다", () => {
    const running = start(createInitialState(settings), T0);
    const state = switchMode(running, "long-break", settings);
    expect(state).toMatchObject({
      mode: "long-break",
      status: "idle",
      remainingMs: 15 * MIN,
    });
  });
});

describe("설정 변경", () => {
  const longer = { ...settings, focusMinutes: 50 };

  it("시작 전이면 새 시간이 바로 반영된다", () => {
    const state = applySettings(createInitialState(settings), longer);
    expect(state.remainingMs).toBe(50 * MIN);
  });

  it("진행 중인 세션은 바뀌지 않는다", () => {
    const running = start(createInitialState(settings), T0);
    expect(applySettings(running, longer)).toBe(running);
  });
});

describe("테스트 모드", () => {
  it("모든 세션이 지정한 초만큼으로 바뀐다", () => {
    const test = { ...settings, testDurationSeconds: 5 };
    const { state } = finishSession(createInitialState(test), test, T0);
    expect(state).toMatchObject({ mode: "short-break", remainingMs: 5000 });
    expect(createInitialState(test).remainingMs).toBe(5000);
  });
});

describe("시간 표시", () => {
  it.each([
    [25 * MIN, "25:00"],
    [61_000, "01:01"],
    [59_001, "01:00"],
    [1, "00:01"],
    [0, "00:00"],
    [120 * MIN, "120:00"],
  ])("%i ms → %s", (ms, text) => {
    expect(formatRemaining(ms)).toBe(text);
  });
});
