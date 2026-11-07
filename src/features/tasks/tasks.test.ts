import { describe, expect, it } from "vitest";
import {
  addTask,
  clearDone,
  ESTIMATE_MAX,
  initialTasksState,
  recordPomodoros,
  removeTask,
  setActiveTask,
  sortForDisplay,
  toggleDone,
  updateTask,
} from "./tasks";
import type { TasksState } from "./types";

const NOW = 1_000;

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
    const state = toggleDone(withTasks("A", "B"), "t1");
    expect(state.tasks[0].done).toBe(true);
    expect(state.activeTaskId).toBe("t2");
  });

  it("남은 할 일이 없으면 선택이 비워진다", () => {
    expect(toggleDone(withTasks("A"), "t1").activeTaskId).toBeNull();
  });

  it("완료를 취소했을 때 선택된 할 일이 없으면 그 할 일이 선택된다", () => {
    const done = toggleDone(withTasks("A"), "t1");
    expect(toggleDone(done, "t1").activeTaskId).toBe("t1");
  });
});

describe("선택", () => {
  it("완료한 할 일은 선택할 수 없다", () => {
    const state = toggleDone(withTasks("A", "B"), "t1");
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
      toggleDone(toggleDone(withTasks("A", "B", "C"), "t1"), "t3"),
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
    const state = toggleDone(withTasks("A", "B", "C"), "t1");
    expect(sortForDisplay(state.tasks).map((t) => t.id)).toEqual([
      "t2",
      "t3",
      "t1",
    ]);
  });
});
