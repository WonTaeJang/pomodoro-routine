import { describe, expect, it } from "vitest";
import { createPetState, petReducer } from "./pet";

describe("돌봄 반응", () => {
  it("연속 쓰다듬기의 중복 이벤트는 세지 않고 350ms부터 다시 받음", () => {
    const first = petReducer(createPetState(), { type: "pet", now: 100 });
    expect(petReducer(first, { type: "pet", now: 449 })).toBe(first);
    expect(petReducer(first, { type: "pet", now: 450 }).pats).toBe(2);
  });

  it("마지막 쓰다듬기부터 2.8초 후에만 대기로 돌아감", () => {
    const first = petReducer(createPetState(), { type: "pet", now: 100 });
    const again = petReducer(first, { type: "pet", now: 1000 });
    // Earlier timer callbacks must not cancel the extended reaction.
    expect(petReducer(again, { type: "settle", now: 2900 })).toBe(again);
    expect(petReducer(again, { type: "settle", now: 3799 })).toBe(again);
    expect(petReducer(again, { type: "settle", now: 3800 })).toEqual({
      pats: 2,
      lastPatAt: 1000,
      happyUntil: null,
    });
  });

  it("백그라운드에서 종료 처리가 늦어져도 횟수를 유지하며 대기로 복귀", () => {
    const state = petReducer(createPetState(), { type: "pet", now: 0 });
    expect(petReducer(state, { type: "settle", now: 60000 })).toEqual({
      pats: 1,
      lastPatAt: 0,
      happyUntil: null,
    });
  });

  it("초기화 뒤에는 이전 쿨다운·종료 예약에 영향받지 않음", () => {
    const state = petReducer(createPetState(), { type: "pet", now: 100 });
    const reset = petReducer(state, { type: "reset" });
    expect(petReducer(reset, { type: "settle", now: 3000 })).toBe(reset);
    expect(petReducer(reset, { type: "pet", now: 110 }).pats).toBe(1);
  });
});
