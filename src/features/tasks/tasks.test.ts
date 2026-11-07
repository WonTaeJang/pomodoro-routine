import { describe, expect, it } from "vitest";
import {
  addTask,
  clearDone,
  ESTIMATE_MAX,
  initialTasksState,
  migrateTasks,
  moveTask,
  recordPomodoros,
  removeTask,
  setActiveTask,
  sortForDisplay,
  toggleDone,
  updateTask,
} from "./tasks";
import type { TasksState } from "./types";

const NOW = 1_000;
const DONE_AT = 9_000;

/** 완료 체크 (완료 시각은 DONE_AT) */
const markDone = (state: TasksState, id: string) =>
  toggleDone(state, id, DONE_AT);

function withTasks(...titles: string[]): TasksState {
  return titles.reduce(
    (state, title, i) =>
      addTask(state, { id: `t${i + 1}`, title, estimate: 2, now: NOW + i }),
    initialTasksState,
  );
}

describe("추가", () => {
  it("첫 할 일은 자동으로 집중할 할 일이 된다", () => {
    const state = withTasks("영어 단어", "알고리즘");
    expect(state.tasks.map((t) => t.title)).toEqual(["영어 단어", "알고리즘"]);
    expect(state.activeTaskId).toBe("t1");
  });

  it("앞뒤 공백을 지우고, 빈 제목은 추가하지 않는다", () => {
    const state = addTask(initialTasksState, {
      id: "a",
      title: "  독서  ",
      estimate: 1,
      now: NOW,
    });
    expect(state.tasks[0].title).toBe("독서");
    expect(
      addTask(state, { id: "b", title: "   ", estimate: 1, now: NOW }),
    ).toBe(state);
  });

  it("예상 개수는 1~20 사이로 맞춘다", () => {
    const state = addTask(initialTasksState, {
      id: "a",
      title: "x",
      estimate: 99,
      now: NOW,
    });
    expect(state.tasks[0].estimate).toBe(ESTIMATE_MAX);
    const low = addTask(initialTasksState, {
      id: "a",
      title: "x",
      estimate: 0,
      now: NOW,
    });
    expect(low.tasks[0].estimate).toBe(1);
  });
});

describe("수정", () => {
  it("제목과 예상 개수를 바꾼다", () => {
    const state = updateTask(withTasks("영어"), "t1", {
      title: "영어 단어 30개",
      estimate: 4,
    });
    expect(state.tasks[0]).toMatchObject({
      title: "영어 단어 30개",
      estimate: 4,
    });
  });

  it("빈 제목으로는 바꾸지 않는다", () => {
    const state = withTasks("영어");
    expect(updateTask(state, "t1", { title: " " })).toBe(state);
  });
});

describe("완료 체크", () => {
  it("집중 중인 할 일을 완료하면 다음 할 일이 선택된다", () => {
    const state = markDone(withTasks("A", "B"), "t1");
    expect(state.tasks[0].done).toBe(true);
    expect(state.activeTaskId).toBe("t2");
  });

  it("남은 할 일이 없으면 선택이 비워진다", () => {
    expect(markDone(withTasks("A"), "t1").activeTaskId).toBeNull();
  });

  it("완료를 취소했을 때 선택된 할 일이 없으면 그 할 일이 선택된다", () => {
    const done = markDone(withTasks("A"), "t1");
    expect(markDone(done, "t1").activeTaskId).toBe("t1");
  });
});

describe("선택", () => {
  it("완료한 할 일은 선택할 수 없다", () => {
    const state = markDone(withTasks("A", "B"), "t1");
    expect(setActiveTask(state, "t1").activeTaskId).toBe("t2");
  });

  it("다른 할 일을 고를 수 있다", () => {
    expect(setActiveTask(withTasks("A", "B"), "t2").activeTaskId).toBe("t2");
  });
});

describe("삭제", () => {
  it("집중 중인 할 일을 지우면 다음 할 일이 선택된다", () => {
    const state = removeTask(withTasks("A", "B"), "t1");
    expect(state.tasks).toHaveLength(1);
    expect(state.activeTaskId).toBe("t2");
  });

  it("완료한 할 일을 한꺼번에 지운다", () => {
    const state = clearDone(
      markDone(markDone(withTasks("A", "B", "C"), "t1"), "t3"),
    );
    expect(state.tasks.map((t) => t.id)).toEqual(["t2"]);
    expect(state.activeTaskId).toBe("t2");
  });
});

describe("뽀모도로 기록", () => {
  it("집중을 마친 할 일에 개수를 더한다", () => {
    const state = recordPomodoros(withTasks("A", "B"), ["t1", "t1", "t2"]);
    expect(state.tasks.map((t) => t.completedPomodoros)).toEqual([2, 1]);
  });
});

describe("표시 순서", () => {
  it("완료한 할 일은 아래로", () => {
    const state = markDone(withTasks("A", "B", "C"), "t1");
    expect(sortForDisplay(state.tasks).map((t) => t.id)).toEqual([
      "t2",
      "t3",
      "t1",
    ]);
  });
});

describe("순서, 등록일, 완료일", () => {
  it("추가한 순서대로 번호와 등록 시각이 저장된다", () => {
    const state = withTasks("A", "B", "C");
    expect(state.tasks.map((t) => [t.order, t.createdAt])).toEqual([
      [0, NOW],
      [1, NOW + 1],
      [2, NOW + 2],
    ]);
    expect(state.tasks.every((t) => t.completedAt === null)).toBe(true);
  });

  it("완료하면 완료 시각이 저장되고, 취소하면 지워진다", () => {
    const done = markDone(withTasks("A"), "t1");
    expect(done.tasks[0].completedAt).toBe(DONE_AT);
    expect(markDone(done, "t1").tasks[0].completedAt).toBeNull();
  });

  it("지운 뒤 추가해도 순서 번호가 겹치지 않는다", () => {
    const state = removeTask(withTasks("A", "B"), "t1");
    const added = addTask(state, {
      id: "x",
      title: "C",
      estimate: 1,
      now: NOW,
    });
    expect(added.tasks.map((t) => t.order)).toEqual([1, 2]);
  });
});

describe("순서 바꾸기", () => {
  it("한 칸 위로, 아래로 옮긴다", () => {
    const up = moveTask(withTasks("A", "B", "C"), "t3", "up");
    expect(sortForDisplay(up.tasks).map((t) => t.id)).toEqual([
      "t1",
      "t3",
      "t2",
    ]);
    const down = moveTask(up, "t1", "down");
    expect(sortForDisplay(down.tasks).map((t) => t.id)).toEqual([
      "t3",
      "t1",
      "t2",
    ]);
  });

  it("맨 위에서 위로, 맨 아래에서 아래로는 움직이지 않는다", () => {
    const state = withTasks("A", "B");
    expect(moveTask(state, "t1", "up")).toBe(state);
    expect(moveTask(state, "t2", "down")).toBe(state);
  });

  it("완료한 할 일과 섞이지 않는다", () => {
    const state = markDone(withTasks("A", "B", "C"), "t2");
    // 화면: A, C | B(완료) → C는 더 아래로 갈 곳이 없음
    expect(moveTask(state, "t3", "down")).toBe(state);
  });

  it("집중 중인 할 일을 완료하면 바뀐 순서상 맨 위 할 일이 선택된다", () => {
    const moved = moveTask(withTasks("A", "B", "C"), "t3", "up"); // A, C, B
    expect(markDone(moved, "t1").activeTaskId).toBe("t3");
  });
});

describe("예전 데이터 변환", () => {
  it("순서와 완료일이 없던 할 일에 값을 채운다", () => {
    const old = [
      {
        id: "a",
        title: "A",
        estimate: 1,
        completedPomodoros: 0,
        done: true,
        createdAt: 1,
      },
      {
        id: "b",
        title: "B",
        estimate: 1,
        completedPomodoros: 0,
        done: false,
        createdAt: 2,
      },
    ];
    expect(migrateTasks(old).map((t) => [t.order, t.completedAt])).toEqual([
      [0, null],
      [1, null],
    ]);
  });
});
