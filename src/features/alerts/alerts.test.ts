import { describe, expect, it } from "vitest";
import {
  createInitialState,
  DEFAULT_SETTINGS,
  pause,
  start,
  switchMode,
} from "@/features/timer/timer";
import { alertKindForSession, getUpcomingAlert } from "./alerts";

const T0 = Date.UTC(2026, 10, 7, 9);
const MIN = 60_000;
const settings = DEFAULT_SETTINGS;

describe("다음 알림", () => {
  it("진행 중이 아니면 알림이 없다", () => {
    const idle = createInitialState(settings);
    expect(getUpcomingAlert(idle, settings)).toBeNull();
    expect(
      getUpcomingAlert(pause(start(idle, T0), T0 + MIN), settings),
    ).toBeNull();
  });

  it("집중이 끝나는 시각에 '집중 끝' 알림", () => {
    const running = start(createInitialState(settings), T0);
    expect(getUpcomingAlert(running, settings)).toEqual({
      at: T0 + 25 * MIN,
      kind: "focus-end",
    });
  });

  it("사이클의 마지막 집중이면 '사이클 완료' 알림", () => {
    const last = {
      ...start(createInitialState(settings), T0),
      completedInCycle: 3,
    };
    expect(getUpcomingAlert(last, settings)?.kind).toBe("cycle-done");
  });

  it("휴식이 끝날 때는 '휴식 끝' 알림", () => {
    const rest = start(
      switchMode(createInitialState(settings), "short-break", settings),
      T0,
    );
    expect(getUpcomingAlert(rest, settings)).toEqual({
      at: T0 + 5 * MIN,
      kind: "break-end",
    });
  });
});

describe("끝난 세션의 알림 종류", () => {
  it.each([
    [{ mode: "focus" as const }, "focus-end"],
    [{ mode: "focus" as const, cycleCompleted: true }, "cycle-done"],
    [{ mode: "short-break" as const }, "break-end"],
    [{ mode: "long-break" as const }, "break-end"],
  ])("%o → %s", (session, kind) => {
    expect(alertKindForSession(session)).toBe(kind);
  });
});
