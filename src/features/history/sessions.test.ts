import { describe, expect, it } from "vitest";
import type { Task } from "@/features/tasks/types";
import type { CompletedSession } from "@/features/timer/types";
import { focusSessions, taskTitleOf } from "./sessions";

const MIN = 60_000;
const at = (d: number, h: number, m = 0) =>
  new Date(2026, 10, d, h, m).getTime();

const focus = (
  endedAt: number,
  extra: Partial<CompletedSession> = {},
): CompletedSession => ({
  mode: "focus",
  endedAt,
  durationMs: 25 * MIN,
  ...extra,
});
const shortBreak = (endedAt: number): CompletedSession => ({
  mode: "short-break",
  endedAt,
  durationMs: 5 * MIN,
});

describe("집중 세션", () => {
  it("휴식은 빼고 끝난 순서대로", () => {
    const sessions = [focus(at(7, 10)), shortBreak(at(7, 9)), focus(at(7, 9))];
    expect(focusSessions(sessions).map((s) => s.endedAt)).toEqual([
      at(7, 9),
      at(7, 10),
    ]);
  });

  it("할 일 제목: 기록에 남은 제목 → 없으면 지금 할 일 제목", () => {
    const tasks = [{ id: "a", title: "지금 제목" } as Task];
    const titleOf = taskTitleOf(tasks);
    expect(titleOf(focus(0, { taskId: "a", taskTitle: "그때 제목" }))).toBe(
      "그때 제목",
    );
    expect(titleOf(focus(0, { taskId: "a" }))).toBe("지금 제목");
    expect(titleOf(focus(0, { taskId: "gone" }))).toBeUndefined();
    expect(titleOf(focus(0))).toBeUndefined();
  });
});
