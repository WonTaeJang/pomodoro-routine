import { describe, expect, it } from "vitest";
import {
  addTask,
  archiveDone,
  ESTIMATE_MAX,
  initialTasksState,
  migrateTasks,
  moveTask,
  recordPomodoros,
  removeTask,
  replaceTasks,
  setActiveTask,
  sortForDisplay,
  toggleDone,
  updateTask,
  visibleTasks,
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
});

describe("완료한 할 일 정리 (숨기기)", () => {
  const ARCHIVED_AT = 20_000;
  const archived = () =>
    archiveDone(
      markDone(markDone(withTasks("A", "B", "C"), "t1"), "t3"),
      ARCHIVED_AT,
    );

  it("완료한 할 일을 목록에서 숨기지만 지우지는 않는다", () => {
    const state = archived();
    expect(visibleTasks(state.tasks).map((t) => t.id)).toEqual(["t2"]);
    expect(state.tasks).toHaveLength(3);
    expect(state.tasks.map((t) => t.archivedAt)).toEqual([
      ARCHIVED_AT,
      null,
      ARCHIVED_AT,
    ]);
    expect(state.activeTaskId).toBe("t2");
  });

  it("숨길 할 일이 없으면 그대로", () => {
    const state = withTasks("A");
    expect(archiveDone(state, ARCHIVED_AT)).toBe(state);
  });

  it("완료를 취소하면 다시 보인다", () => {
    const state = toggleDone(archived(), "t1", NOW);
    expect(visibleTasks(state.tasks).map((t) => t.id)).toEqual(["t1", "t2"]);
  });

  it("숨긴 할 일은 순서 바꾸기에서 빠진다", () => {
    // 보이는 완료 묶음: D / 숨긴 완료: A, C
    const base = markDone(archived(), "t2");
    const state = addTask(base, {
      id: "t4",
      title: "D",
      estimate: 1,
      now: NOW,
    });
    const done = markDone(state, "t4");
    expect(moveTask(done, "t4", "t1")).toBe(done);
    expect(moveTask(done, "t1", "t4")).toBe(done);
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
  const ids = (state: TasksState) =>
    sortForDisplay(state.tasks).map((t) => t.id);

  it("아래 할 일을 위 할 일 자리로 옮긴다", () => {
    const state = moveTask(withTasks("A", "B", "C", "D"), "t4", "t2");
    expect(ids(state)).toEqual(["t1", "t4", "t2", "t3"]);
  });

  it("위 할 일을 아래 할 일 자리로 옮긴다", () => {
    const state = moveTask(withTasks("A", "B", "C", "D"), "t1", "t3");
    expect(ids(state)).toEqual(["t2", "t3", "t1", "t4"]);
  });

  it("제자리나 없는 할 일로는 움직이지 않는다", () => {
    const state = withTasks("A", "B");
    expect(moveTask(state, "t1", "t1")).toBe(state);
    expect(moveTask(state, "t1", "x")).toBe(state);
    expect(moveTask(state, "x", "t1")).toBe(state);
  });

  it("완료한 할 일과 섞이지 않는다", () => {
    const state = markDone(withTasks("A", "B", "C"), "t2");
    // 화면: A, C | B(완료)
    expect(moveTask(state, "t3", "t2")).toBe(state);
    expect(moveTask(state, "t2", "t1")).toBe(state);
  });

  it("다른 묶음의 순서는 그대로 둔다", () => {
    // 화면: B, D | A(완료), C(완료)
    const state = markDone(markDone(withTasks("A", "B", "C", "D"), "t1"), "t3");
    const moved = moveTask(state, "t4", "t2");
    expect(ids(moved)).toEqual(["t4", "t2", "t1", "t3"]);
    // 완료를 취소하면 원래 순서 번호 자리로 돌아감: A, D, B
    const undone = toggleDone(moved, "t1", NOW);
    expect(ids(undone).slice(0, 3)).toEqual(["t1", "t4", "t2"]);
  });

  it("집중 중인 할 일을 완료하면 바뀐 순서상 맨 위 할 일이 선택된다", () => {
    const moved = moveTask(withTasks("A", "B", "C"), "t3", "t2"); // A, C, B
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
    expect(
      migrateTasks(old).map((t) => [t.order, t.completedAt, t.archivedAt]),
    ).toEqual([
      [0, null, null],
      [1, null, null],
    ]);
  });
});

describe("목록 통째로 바꾸기 (계정에서 받은 변경)", () => {
  it("집중할 할 일이 남아 있으면 그대로", () => {
    const state = withTasks("a", "b");
    const next = replaceTasks(state, state.tasks.slice().reverse());
    expect(next.activeTaskId).toBe("t1");
  });

  it("집중할 할 일이 없어지거나 완료되면 남은 할 일 중 첫 번째로", () => {
    const state = withTasks("a", "b", "c");
    expect(replaceTasks(state, state.tasks.slice(1)).activeTaskId).toBe("t2");
    const doneFirst = state.tasks.map((t) =>
      t.id === "t1" ? { ...t, done: true } : t,
    );
    expect(replaceTasks(state, doneFirst).activeTaskId).toBe("t2");
    expect(replaceTasks(state, []).activeTaskId).toBeNull();
  });

  it("고르지 않은 상태면 그대로 둠", () => {
    const state = setActiveTask(withTasks("a"), null);
    expect(replaceTasks(state, state.tasks).activeTaskId).toBeNull();
  });
});
