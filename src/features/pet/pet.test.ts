import { describe, expect, it } from "vitest";
import { createPetState, petReducer } from "./pet";

function awakeState() {
  const sleeping = petReducer(createPetState(), { type: "start", now: -5000 });
  return petReducer(sleeping, { type: "advanceIntro", now: 0 });
}

describe("돌봄 반응", () => {
  it("연속 쓰다듬기의 중복 이벤트는 세지 않고 350ms부터 다시 받음", () => {
    const first = petReducer(awakeState(), { type: "pet", now: 100 });
    expect(petReducer(first, { type: "pet", now: 449 })).toBe(first);
    expect(petReducer(first, { type: "pet", now: 450 }).pats).toBe(2);
  });

  it("마지막 쓰다듬기부터 2.8초 후에만 대기로 돌아감", () => {
    const first = petReducer(awakeState(), { type: "pet", now: 100 });
    const again = petReducer(first, { type: "pet", now: 1000 });
    // Earlier timer callbacks must not cancel the extended reaction.
    expect(petReducer(again, { type: "settle", now: 2900 })).toBe(again);
    expect(petReducer(again, { type: "settle", now: 3799 })).toBe(again);
    expect(petReducer(again, { type: "settle", now: 3800 })).toMatchObject({
      pats: 2,
      lastPatAt: 1000,
      happyUntil: null,
    });
  });

  it("백그라운드에서 종료 처리가 늦어져도 횟수를 유지하며 대기로 복귀", () => {
    const state = petReducer(awakeState(), { type: "pet", now: 0 });
    expect(petReducer(state, { type: "settle", now: 60000 })).toMatchObject({
      pats: 1,
      lastPatAt: 0,
      happyUntil: null,
    });
  });

  it("초기화 뒤에는 이전 쿨다운·종료 예약에 영향받지 않음", () => {
    const state = petReducer(awakeState(), { type: "pet", now: 100 });
    const reset = petReducer(state, { type: "reset" });
    expect(petReducer(reset, { type: "settle", now: 3000 })).toBe(reset);
    expect(reset).toEqual(createPetState());
    expect(petReducer(reset, { type: "pet", now: 110 })).toBe(reset);
  });
});

describe("첫 만남 수면과 깨우기", () => {
  it("장면 준비 전에는 수면 시간이 흐르지 않고 준비된 뒤 5초를 기다림", () => {
    const initial = createPetState();
    expect(petReducer(initial, { type: "advanceIntro", now: 10000 })).toBe(
      initial,
    );
    expect(petReducer(initial, { type: "pet", now: 10000 })).toBe(initial);
    const sleeping = petReducer(initial, { type: "start", now: 10000 });
    expect(petReducer(sleeping, { type: "start", now: 11000 })).toBe(sleeping);
    expect(petReducer(sleeping, { type: "advanceIntro", now: 14999 })).toBe(
      sleeping,
    );
    expect(
      petReducer(sleeping, { type: "advanceIntro", now: 15000 }),
    ).toMatchObject({ phase: "awake", introUntil: null, pats: 0 });
  });

  it("첫 클릭은 1초 놀란 뒤 깨우고 이후 클릭부터 쓰담으로 셈", () => {
    const sleeping = petReducer(createPetState(), { type: "start", now: 0 });
    const startled = petReducer(sleeping, { type: "pet", now: 100 });
    expect(startled).toMatchObject({
      phase: "startled",
      introUntil: 1100,
      pats: 0,
    });
    expect(petReducer(startled, { type: "pet", now: 300 })).toBe(startled);
    expect(petReducer(startled, { type: "advanceIntro", now: 1099 })).toBe(
      startled,
    );
    const awake = petReducer(startled, { type: "advanceIntro", now: 1100 });
    expect(awake).toMatchObject({ phase: "awake", introUntil: null, pats: 0 });
    expect(petReducer(awake, { type: "pet", now: 1100 }).pats).toBe(1);
    expect(petReducer(awake, { type: "advanceIntro", now: 5000 })).toBe(awake);
  });

  it("백그라운드에서 자동 깨우기가 늦어져도 대기로 돌아옴", () => {
    const sleeping = petReducer(createPetState(), { type: "start", now: 0 });
    expect(
      petReducer(sleeping, { type: "advanceIntro", now: 60000 }),
    ).toMatchObject({ phase: "awake", introUntil: null, pats: 0 });
  });

  it("다시 만나기는 수면부터 시작하며 이전 깨우기 예약이 새 수면을 끊지 않음", () => {
    const reset = petReducer(awakeState(), { type: "reset" });
    expect(petReducer(reset, { type: "advanceIntro", now: 100 })).toBe(reset);
    const sleeping = petReducer(reset, { type: "start", now: 200 });
    expect(sleeping).toMatchObject({
      phase: "sleeping",
      introUntil: 5200,
      pats: 0,
    });
    expect(petReducer(sleeping, { type: "advanceIntro", now: 5000 })).toBe(
      sleeping,
    );
  });
});

describe("깨우기 반응 중 예약 처리", () => {
  it("자동 깨우기 직전 클릭하면 기존 예약이 1초 반응을 끊지 않음", () => {
    const sleeping = petReducer(createPetState(), { type: "start", now: 0 });
    const startled = petReducer(sleeping, { type: "pet", now: 4900 });
    expect(petReducer(startled, { type: "advanceIntro", now: 5000 })).toBe(
      startled,
    );
    expect(petReducer(startled, { type: "pet", now: 5899 })).toBe(startled);
    expect(
      petReducer(startled, { type: "advanceIntro", now: 5900 }),
    ).toMatchObject({ phase: "awake", introUntil: null, pats: 0 });
  });
  it("반응 도중 재시작해도 이전 종료 예약이 새로운 수면을 끊지 않음", () => {
    const sleeping = petReducer(createPetState(), { type: "start", now: 0 });
    const startled = petReducer(sleeping, { type: "pet", now: 100 });
    const reset = petReducer(startled, { type: "reset" });
    const again = petReducer(reset, { type: "start", now: 200 });
    expect(petReducer(again, { type: "advanceIntro", now: 1100 })).toBe(again);
    expect(again).toMatchObject({
      phase: "sleeping",
      pats: 0,
      introUntil: 5200,
    });
  });
});

describe("간식 입력", () => {
  it("수면에서는 먹지 않고 깨어 있을 때 간식만 셈", () => {
    expect(petReducer(createPetState(), { type: "feed", now: 0 }).snacks).toBe(
      0,
    );
    const first = petReducer(awakeState(), { type: "feed", now: 100 });
    expect(petReducer(first, { type: "feed", now: 101 })).toMatchObject({
      snacks: 2,
      pats: 0,
    });
  });
});

describe("먹기 반응", () => {
  it("먹는 중 쓰담은 먹기를 마친 뒤 반응", () => {
    const eating = petReducer(awakeState(), { type: "feed", now: 100 });
    const patted = petReducer(eating, { type: "pet", now: 200 });
    expect(patted).toMatchObject({
      snacks: 1,
      pats: 1,
      snackUntil: 1900,
      happyUntil: 4700,
    });
    expect(petReducer(patted, { type: "settle", now: 1900 })).toMatchObject({
      snackUntil: null,
      happyUntil: 4700,
    });
  });
});

describe("지연된 반응 종료", () => {
  it.each(["feed", "pet"] as const)(
    "종료 콜백이 늦어도 %s 결과가 같음",
    (type) => {
      const eating = petReducer(awakeState(), { type: "feed", now: 100 });
      const patted = petReducer(eating, { type: "pet", now: 200 });
      for (const now of [1900, 4700, 20000]) {
        expect(petReducer(patted, { type, now })).toEqual(
          petReducer(petReducer(patted, { type: "settle", now }), {
            type,
            now,
          }),
        );
      }
    },
  );
});
