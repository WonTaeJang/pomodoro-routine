import { describe, expect, it } from "vitest";
import type { CompletedSession } from "@/features/timer/types";
import { fromSessionRow, toSessionRow } from "./sessionRows";

const USER = "11111111-1111-4111-8111-111111111111";
const TASK = "22222222-2222-4222-8222-222222222222";
const ENDED = Date.UTC(2026, 10, 11, 3, 25, 0, 123);

describe("toSessionRow", () => {
  it("집중 기록을 표의 열 이름으로 바꿈", () => {
    const session: CompletedSession = {
      mode: "focus",
      endedAt: ENDED,
      durationMs: 25 * 60 * 1000,
      taskId: TASK,
      taskTitle: "보고서 쓰기",
      cycleCompleted: true,
    };
    expect(toSessionRow(session, USER)).toEqual({
      user_id: USER,
      mode: "focus",
      ended_at: "2026-11-11T03:25:00.123Z",
      duration_ms: 1500000,
      task_id: TASK,
      task_title: "보고서 쓰기",
      cycle_completed: true,
    });
  });

  it("할 일이 없는 기록은 빈 값으로", () => {
    const row = toSessionRow(
      { mode: "short-break", endedAt: ENDED, durationMs: 300000 },
      USER,
    );
    expect(row).toMatchObject({
      task_id: null,
      task_title: null,
      cycle_completed: false,
    });
  });

  it("uuid가 아닌 할 일 id는 비우고 제목은 100자까지만", () => {
    const row = toSessionRow(
      {
        mode: "focus",
        endedAt: ENDED,
        durationMs: 1000.4,
        taskId: "old-id",
        taskTitle: "가".repeat(120),
      },
      USER,
    );
    expect(row?.task_id).toBeNull();
    expect(row?.task_title).toHaveLength(100);
    expect(row?.duration_ms).toBe(1000);
  });

  it("표가 받지 않는 기록(길이 0, 모르는 종류, 잘못된 시각)은 올리지 않음", () => {
    const base = { mode: "focus", endedAt: ENDED, durationMs: 1000 } as const;
    expect(toSessionRow({ ...base, durationMs: 0 }, USER)).toBeNull();
    expect(toSessionRow({ ...base, endedAt: Number.NaN }, USER)).toBeNull();
    expect(
      toSessionRow(
        { ...base, mode: "nap" } as unknown as CompletedSession,
        USER,
      ),
    ).toBeNull();
  });
});

describe("fromSessionRow", () => {
  it("올린 기록을 받아오면 원래 기록과 같음 (같은 기록으로 알아봄)", () => {
    const sessions: CompletedSession[] = [
      {
        mode: "focus",
        endedAt: ENDED,
        durationMs: 1500000,
        taskId: TASK,
        taskTitle: "보고서 쓰기",
        cycleCompleted: true,
      },
      { mode: "long-break", endedAt: ENDED + 1, durationMs: 900000 },
    ];
    for (const session of sessions) {
      const row = toSessionRow(session, USER)!;
      expect(fromSessionRow(row)).toEqual(session);
    }
  });

  it("서버가 돌려주는 시각 모양(+00:00, 마이크로초)도 읽음", () => {
    const session = fromSessionRow({
      mode: "focus",
      ended_at: "2026-11-11T03:25:00.123+00:00",
      duration_ms: 1500000,
      task_id: null,
      task_title: null,
      cycle_completed: false,
    });
    expect(session).toEqual({
      mode: "focus",
      endedAt: ENDED,
      durationMs: 1500000,
    });
  });

  it("읽을 수 없는 줄은 버림", () => {
    const row = {
      mode: "focus",
      ended_at: "어제",
      duration_ms: 1,
      task_id: null,
      task_title: null,
      cycle_completed: false,
    } as const;
    expect(fromSessionRow(row)).toBeNull();
  });
});
