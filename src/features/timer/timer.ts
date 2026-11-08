import type {
  CompletedSession,
  TimerMode,
  TimerSettings,
  TimerState,
  TimerTransition,
} from "./types";

/**
 * 타이머 규칙을 담은 순수 함수 모음.
 * 현재 시각(now)을 인자로 받기 때문에 테스트에서 시간을 마음대로 넣어 검증할 수 있습니다.
 * 남은 시간은 1초씩 빼지 않고 "끝나는 시각 - 현재 시각"으로 계산합니다.
 */

const MINUTE = 60_000;

export const DEFAULT_SETTINGS: TimerSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundEnabled: true,
  soundVolume: 0.7,
  notificationsEnabled: true,
  ringEffects: true,
  keepScreenOn: true,
  certificateShowTasks: true,
};

function getModeDurationMs(mode: TimerMode, settings: TimerSettings): number {
  if (settings.testDurationSeconds) return settings.testDurationSeconds * 1000;
  const minutes = {
    focus: settings.focusMinutes,
    "short-break": settings.shortBreakMinutes,
    "long-break": settings.longBreakMinutes,
  }[mode];
  return minutes * MINUTE;
}

/** 새 세션을 시작 전(idle) 상태로 만듭니다. */
function createSession(
  mode: TimerMode,
  completedInCycle: number,
  settings: TimerSettings,
): TimerState {
  const durationMs = getModeDurationMs(mode, settings);
  return {
    mode,
    status: "idle",
    durationMs,
    remainingMs: durationMs,
    endsAt: null,
    completedInCycle,
  };
}

export function createInitialState(
  settings: TimerSettings = DEFAULT_SETTINGS,
): TimerState {
  return createSession("focus", 0, settings);
}

export function getRemainingMs(state: TimerState, now: number): number {
  if (state.status === "running" && state.endsAt !== null) {
    // 화면 시계(now)는 최대 0.25초 늦을 수 있어서, 시작 직후에 시작 시점의
    // 남은 시간(remainingMs)보다 커 보이지 않게 막음 (20초 → 21초로 보이는 문제)
    return Math.min(state.remainingMs, Math.max(0, state.endsAt - now));
  }
  return state.remainingMs;
}

/** 이번 사이클에서 몇 번째 집중을 마쳤는지에 따라 다음 휴식을 고릅니다. */
function breakAfterFocus(
  completedInCycle: number,
  settings: TimerSettings,
): TimerMode {
  return completedInCycle >= settings.longBreakInterval
    ? "long-break"
    : "short-break";
}

/** 자동 시작 전에 완료 팝업에서 기다리는 시간 */
export const AUTO_START_DELAY_MS = 5_000;

function shouldAutoStart(mode: TimerMode, settings: TimerSettings): boolean {
  return mode === "focus" ? settings.autoStartFocus : settings.autoStartBreaks;
}

/** 시작하거나 일시정지에서 이어서 시작합니다. */
export function start(state: TimerState, now: number): TimerState {
  if (state.status === "running") return state;
  return {
    ...state,
    status: "running",
    endsAt: now + state.remainingMs,
    autoStart: null,
  };
}

/** 완료 팝업이 보이기 시작했을 때, 자동 시작까지 5초를 세기 시작합니다. */
export function beginAutoStart(state: TimerState, now: number): TimerState {
  if (
    state.status !== "idle" ||
    !state.autoStart ||
    state.autoStart.at !== null
  ) {
    return state;
  }
  return { ...state, autoStart: { at: now + AUTO_START_DELAY_MS } };
}

/** 이번에는 자동으로 시작하지 않습니다. 다음 세션은 시작 전 상태로 남고, 자동 시작 설정은 그대로입니다. */
export function cancelAutoStart(state: TimerState): TimerState {
  return state.autoStart ? { ...state, autoStart: null } : state;
}

export function pause(state: TimerState, now: number): TimerState {
  if (state.status !== "running") return state;
  return {
    ...state,
    status: "paused",
    remainingMs: getRemainingMs(state, now),
    endsAt: null,
  };
}

/** 지금 세션을 처음으로 되돌립니다. 완료로 세지 않습니다. */
export function reset(state: TimerState, settings: TimerSettings): TimerState {
  return createSession(state.mode, state.completedInCycle, settings);
}

/** 모드 탭으로 직접 바꿉니다. 진행 중이던 세션은 완료로 세지 않습니다. */
export function switchMode(
  state: TimerState,
  mode: TimerMode,
  settings: TimerSettings,
): TimerState {
  return createSession(mode, state.completedInCycle, settings);
}

/** 다음 세션으로 건너뜁니다. 건너뛴 세션은 완료로 세지 않습니다. */
export function skip(state: TimerState, settings: TimerSettings): TimerState {
  if (state.mode === "focus") {
    return createSession(
      breakAfterFocus(state.completedInCycle, settings),
      state.completedInCycle,
      settings,
    );
  }
  const completedInCycle =
    state.mode === "long-break" ? 0 : state.completedInCycle;
  return createSession("focus", completedInCycle, settings);
}

/**
 * 진행 중인 세션이 끝났는지 확인하고, 끝났으면 완료 처리 후 다음 세션으로 넘어갑니다.
 *
 * 자동 시작:
 * - 자동 시작 차례면 다음 세션을 "자동 시작 대기"로 둡니다. 완료 팝업이 보이면 5초를 센 뒤,
 *   그 시각부터 다음 세션이 시작됩니다. (팝업을 못 보는 동안, 즉 다른 탭이거나 자리를 비우면 기다림)
 * - 사이클을 마친 순간(긴 휴식 차례, 수료증 시점)은 자동 시작이 켜져 있어도 긴 휴식을 시작 전 상태로 둡니다.
 *
 * 자리를 비운 사이 끝난 경우:
 * - 끝난 세션 1개만 완료로 기록합니다.
 * - 5초를 세는 중에 자리를 비워서 다음 세션 시간까지 다 지났으면 시작 전 상태로 둡니다.
 *   자리를 비운 동안 뽀모도로가 저절로 쌓이지 않게 하기 위함입니다.
 */
export function sync(
  state: TimerState,
  settings: TimerSettings,
  now: number,
): TimerTransition {
  const autoStartAt = state.status === "idle" ? state.autoStart?.at : null;
  if (autoStartAt != null && now >= autoStartAt) {
    const endsAt = autoStartAt + state.remainingMs;
    const started: TimerState =
      now < endsAt
        ? { ...state, status: "running", endsAt, autoStart: null }
        : { ...state, autoStart: null };
    return { state: started, completed: [] };
  }

  if (
    state.status !== "running" ||
    state.endsAt === null ||
    now < state.endsAt
  ) {
    return { state, completed: [] };
  }

  const endedAt = state.endsAt;
  const completed: CompletedSession = {
    mode: state.mode,
    endedAt,
    durationMs: state.durationMs,
  };

  let next: TimerState;
  if (state.mode === "focus") {
    const completedInCycle = state.completedInCycle + 1;
    if (completedInCycle >= settings.longBreakInterval) {
      completed.cycleCompleted = true;
    }
    next = createSession(
      breakAfterFocus(completedInCycle, settings),
      completedInCycle,
      settings,
    );
  } else {
    const completedInCycle =
      state.mode === "long-break" ? 0 : state.completedInCycle;
    next = createSession("focus", completedInCycle, settings);
  }

  // 사이클을 마친 순간(수료증 시점)은 자동 시작 설정과 상관없이 멈춤
  if (!completed.cycleCompleted && shouldAutoStart(next.mode, settings)) {
    next = { ...next, autoStart: { at: null } };
  }

  return { state: next, completed: [completed] };
}

/** 설정이 바뀌었을 때 시작 전 세션의 길이를 새 설정에 맞춥니다. 진행 중이거나 일시정지한 세션은 그대로 둡니다. */
export function applySettings(
  state: TimerState,
  settings: TimerSettings,
): TimerState {
  if (state.status !== "idle") return state;
  return {
    ...createSession(state.mode, state.completedInCycle, settings),
    autoStart: state.autoStart,
  };
}

/** 남은 시간을 "mm:ss"로. 초는 올림해서 0초가 되는 순간 끝나 보이게 합니다. */
export function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
