import { describe, expect, it } from "vitest";
import type { Task } from "@/features/tasks/types";
import type { CompletedSession } from "@/features/timer/types";
import { getTranslator } from "@/i18n";
import { getCertificateMessage, getCertificate } from "./certificate";

const MIN = 60_000;
const day = (d: number, h: number, m = 0) =>
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
const breakAt = (endedAt: number): CompletedSession => ({
  mode: "short-break",
  endedAt,
  durationMs: 5 * MIN,
});

const task = (id: string, title: string): Task => ({
  id,
  title,
  estimate: 1,
  completedPomodoros: 0,
  done: false,
  order: 0,
  createdAt: 0,
  completedAt: null,
  archivedAt: null,
});

/** 4번 집중으로 한 사이클 */
function cycle(d: number, h: number, taskIds: (string | undefined)[] = []) {
  return [0, 1, 2, 3].flatMap((i) => [
    focus(day(d, h, i * 30 + 25), {
      taskId: taskIds[i],
      cycleCompleted: i === 3 ? true : undefined,
    }),
    breakAt(day(d, h, i * 30 + 30)),
  ]);
}

describe("수료증 내용", () => {
  it("완료한 사이클이 없으면 null", () => {
    expect(getCertificate([focus(day(7, 9))], [])).toBeNull();
  });

  it("가장 최근 사이클의 번호, 집중 횟수와 시간, 마친 시각", () => {
    const sessions = [...cycle(6, 9), ...cycle(7, 9), ...cycle(7, 14)];
    const data = getCertificate(sessions, []);
    expect(data).toMatchObject({
      number: 3,
      completedAt: day(7, 15, 55),
      focusCount: 4,
      focusEachMs: 25 * MIN,
      focusTotalMs: 100 * MIN,
    });
  });

  it("그날 완료한 사이클 수 (전날 사이클은 빼고)", () => {
    const sessions = [...cycle(6, 9), ...cycle(7, 9), ...cycle(7, 14)];
    expect(getCertificate(sessions, [])?.cyclesThatDay).toBe(2);
  });

  it("지난 사이클도 번호로 만든다. 그날 수는 그 사이클까지만 셈", () => {
    const sessions = [...cycle(6, 9), ...cycle(7, 9), ...cycle(7, 14)];
    expect(getCertificate(sessions, [], 2)).toMatchObject({
      number: 2,
      completedAt: day(7, 10, 55),
      cyclesThatDay: 1,
    });
    expect(getCertificate(sessions, [], 0)).toBeNull();
    expect(getCertificate(sessions, [], 4)).toBeNull();
  });

  it("기록에 남은 제목을 먼저 쓰고, 지운 할 일도 제목이 남는다", () => {
    const tasks = [task("a", "바뀐 제목")];
    const sessions = cycle(7, 9, ["a", "deleted"]);
    sessions[0] = { ...sessions[0], taskTitle: "처음 제목" };
    sessions[2] = { ...sessions[2], taskTitle: "지운 할 일" };
    expect(getCertificate(sessions, tasks)?.taskTitles).toEqual([
      "처음 제목",
      "지운 할 일",
    ]);
  });

  it("할 일 제목: 집중한 순서대로, 중복 없이, 지운 할 일은 빼고", () => {
    const tasks = [task("a", "영어 단어"), task("b", "알고리즘")];
    const sessions = cycle(7, 9, ["b", "a", "b", "deleted"]);
    expect(getCertificate(sessions, tasks)?.taskTitles).toEqual([
      "알고리즘",
      "영어 단어",
    ]);
  });

  it("사이클 중에 집중 시간을 바꿨으면 한 번 길이는 null", () => {
    const sessions = cycle(7, 9);
    sessions[0] = { ...sessions[0], durationMs: 50 * MIN };
    const data = getCertificate(sessions, []);
    expect(data?.focusEachMs).toBeNull();
    expect(data?.focusTotalMs).toBe(125 * MIN);
  });

  it("긴 휴식 주기를 바꿔도 직전 사이클 뒤부터 이번 사이클까지를 셈", () => {
    const sessions = [
      ...cycle(7, 9),
      focus(day(7, 12), {}),
      focus(day(7, 12, 30), { cycleCompleted: true }),
    ];
    expect(getCertificate(sessions, [])?.focusCount).toBe(2);
  });
});

describe("본문", () => {
  it("한 번 길이가 같으면 길이를 넣고, 섞였으면 횟수만", () => {
    const base = {
      number: 1,
      completedAt: 0,
      focusCount: 4,
      focusTotalMs: 100 * MIN,
      cyclesThatDay: 1,
      taskTitles: [],
    };
    const ko = getTranslator("ko");
    expect(
      getCertificateMessage(ko, "ko", { ...base, focusEachMs: 25 * MIN }),
    ).toEqual(["25분 집중을 4번 해내었기에", "이 수료증을 드립니다."]);
    expect(
      getCertificateMessage(ko, "ko", { ...base, focusEachMs: null })[0],
    ).toBe("집중을 4번 해내었기에");

    const en = getTranslator("en");
    expect(
      getCertificateMessage(en, "en", { ...base, focusEachMs: 25 * MIN }),
    ).toEqual([
      "For completing 4 focus sessions of 25 min,",
      "this certificate is proudly awarded.",
    ]);
    expect(
      getCertificateMessage(en, "en", {
        ...base,
        focusCount: 1,
        focusEachMs: null,
      })[0],
    ).toBe("For completing 1 focus session,");
  });
});
