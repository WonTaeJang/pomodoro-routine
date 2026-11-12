import { describe, expect, it } from "vitest";
import type { Task } from "@/features/tasks/types";
import { fromTaskRow, taskShape, toTaskRow } from "./taskRows";

const USER = "11111111-1111-4111-8111-111111111111";
const ID = "22222222-2222-4222-8222-222222222222";

const task = (patch: Partial<Task> = {}): Task => ({
  id: ID,
  title: "보고서 쓰기",
  estimate: 3,
  completedPomodoros: 1,
  done: false,
  order: 2,
  createdAt: Date.UTC(2026, 10, 12, 1, 0, 0, 7),
  completedAt: null,
  archivedAt: null,
  ...patch,
});

describe("toTaskRow", () => {
  it("할 일을 표의 열 이름으로 바꿈", () => {
    expect(toTaskRow(task({ done: true, completedAt: 0 }), USER)).toEqual({
      user_id: USER,
      id: ID,
      title: "보고서 쓰기",
      estimate: 3,
      completed_pomodoros: 1,
      done: true,
      sort_order: 2,
      created_at: "2026-11-12T01:00:00.007Z",
      completed_at: "1970-01-01T00:00:00.000Z",
      archived_at: null,
      deleted_at: null,
    });
  });

  it("표가 받지 않는 할 일은 올리지 않음 (uuid가 아닌 id, 빈 제목, 범위 밖 예상 수)", () => {
    expect(toTaskRow(task({ id: "t1" }), USER)).toBeNull();
    expect(toTaskRow(task({ title: "   " }), USER)).toBeNull();
    expect(toTaskRow(task({ title: "가".repeat(101) }), USER)).toBeNull();
    expect(toTaskRow(task({ estimate: 0 }), USER)).toBeNull();
    expect(toTaskRow(task({ estimate: 21 }), USER)).toBeNull();
    expect(toTaskRow(task({ completedPomodoros: -1 }), USER)).toBeNull();
  });
});

describe("fromTaskRow", () => {
  it("올린 할 일을 받아오면 원래와 같은 모양", () => {
    const original = task({
      done: true,
      completedAt: Date.UTC(2026, 10, 12, 2),
      archivedAt: Date.UTC(2026, 10, 12, 3),
    });
    const row = toTaskRow(original, USER)!;
    const back = fromTaskRow({ ...row, updated_at: "2026-11-12T04:00:00Z" });
    expect(back).toEqual(original);
    expect(taskShape(back!)).toBe(taskShape(original));
  });

  it("서버가 돌려주는 시각 모양(+00:00)도 읽음", () => {
    const row = toTaskRow(task(), USER)!;
    const back = fromTaskRow({
      ...row,
      created_at: "2026-11-12T01:00:00.007+00:00",
      updated_at: "2026-11-12T04:00:00+00:00",
    });
    expect(back?.createdAt).toBe(task().createdAt);
  });
});

describe("taskShape", () => {
  it("올리는 항목이 바뀌면 달라지고, 제목 앞뒤 공백은 무시", () => {
    expect(taskShape(task())).toBe(taskShape(task({ title: " 보고서 쓰기 " })));
    expect(taskShape(task())).not.toBe(taskShape(task({ order: 3 })));
    expect(taskShape(task())).not.toBe(taskShape(task({ done: true })));
  });
});
