import { describe, expect, it } from "vitest";
import { createPetState, petReducer, petPose, nextReactionAt } from "./pet";
import { createPetCareStore } from "./careStore";

function awakeState() {
  const sleeping = petReducer(createPetState(), { type: "start", now: -5000 });
  return petReducer(sleeping, { type: "advanceIntro", now: 0 });
}

describe("산책", () => {
  it("수면·놀람 중에는 진입하지 않음", () => {
    const sleeping = petReducer(createPetState(), { type: "start", now: 0 });
    const startled = petReducer(sleeping, { type: "pet", now: 100 });
    for (const state of [createPetState(), sleeping, startled]) {
      expect(petReducer(state, { type: "walk", now: 200 })).toBe(state);
    }
  });

  it.each([
    { type: "pet", duration: 2800 },
    { type: "feed", duration: 1800 },
  ] as const)(
    "$type 반응 종료부터 산책 가능하고, 늦은 종료 콜백에도 중복 실행하지 않음",
    ({ type, duration }) => {
      const active = petReducer(awakeState(), { type, now: 0 });
      expect(petReducer(active, { type: "walk", now: duration - 1 })).toBe(
        active,
      );
      const walking = petReducer(active, { type: "walk", now: duration });
      expect(walking.location).toBe("walk");
      expect(nextReactionAt(walking)).toBeNull();
      for (const type of [
        "pet",
        "feed",
        "walk",
        "settle",
        "start",
        "advanceIntro",
      ] as const) {
        expect(petReducer(walking, { type, now: 60000 })).toBe(walking);
      }
      const home = petReducer(walking, { type: "returnHome", now: 0 });
      expect(home).toMatchObject({
        location: "home",
        phase: "awake",
        introUntil: null,
        pats: active.pats,
        snacks: active.snacks,
      });
      expect(petPose(home)).toBe("idle");
      expect(petReducer(home, { type: "returnHome", now: 0 })).toBe(home);
      expect(petReducer(home, { type: "feed", now: 60000 }).snacks).toBe(
        active.snacks + 1,
      );
    },
  );

  it("반복 산책과 무시한 입력은 저장 콜백을 호출하지 않음", () => {
    let pats = 0;
    let snacks = 0;
    const store = createPetCareStore(
      () => pats++,
      () => snacks++,
    );
    const { dispatch } = store.getState();
    dispatch({ type: "start", now: -5000 });
    dispatch({ type: "advanceIntro", now: 0 });
    for (let round = 0; round < 10; round++) {
      dispatch({ type: "walk", now: round });
      dispatch({ type: "pet", now: round });
      dispatch({ type: "feed", now: round });
      dispatch({ type: "returnHome", now: 0 });
    }
    expect({ pats, snacks }).toEqual({ pats: 0, snacks: 0 });
    expect(store.getState().state.location).toBe("home");
    expect(
      createPetCareStore(
        () => {},
        () => {},
      ).getState().state,
    ).toEqual(createPetState());
  });
});

describe("돌봄 반응", () => {
  const reactions = [
    { type: "feed", duration: 1800, pose: "snacking" },
    { type: "pet", duration: 2800, pose: "happy" },
  ] as const;

  for (const first of reactions) {
    it.each(["feed", "pet"] as const)(
      `${first.type} 중 %s 입력은 막고 종료 경계부터 다시 받음`,
      (type) => {
        const active = petReducer(awakeState(), { type: first.type, now: 100 });
        const end = 100 + first.duration;
        for (const now of [100, 101, end - 1]) {
          expect(petReducer(active, { type, now })).toBe(active);
        }
        expect(petPose(active)).toBe(first.pose);
        expect(nextReactionAt(active)).toBe(end);
        expect(petReducer(active, { type: "settle", now: end - 1 })).toBe(
          active,
        );

        const idle = petReducer(active, { type: "settle", now: end });
        expect(petPose(idle)).toBe("idle");
        expect(nextReactionAt(idle)).toBeNull();
        // The deadline remains authoritative even when the timer was delayed.
        for (const now of [end, 20000]) {
          const next = petReducer(active, { type, now });
          expect(next).toEqual(petReducer(idle, { type, now }));
          expect(next.pats).toBe(active.pats + Number(type === "pet"));
          expect(next.snacks).toBe(active.snacks + Number(type === "feed"));
          expect(nextReactionAt(next)).toBe(
            now + (type === "pet" ? 2800 : 1800),
          );
        }
      },
    );

    it(`${first.type} 중 무시한 입력은 종료 뒤 자동 실행하지 않음`, () => {
      let active = petReducer(awakeState(), { type: first.type, now: 100 });
      active = petReducer(active, { type: "feed", now: 200 });
      active = petReducer(active, { type: "pet", now: 300 });
      const idle = petReducer(active, {
        type: "settle",
        now: 100 + first.duration,
      });
      expect(petPose(idle)).toBe("idle");
      expect(idle).toMatchObject({
        pats: Number(first.type === "pet"),
        snacks: Number(first.type === "feed"),
        happyUntil: null,
        snackUntil: null,
      });
    });
  }

  it("백그라운드에서 종료 처리가 늦어져도 횟수를 유지하며 대기로 복귀", () => {
    const state = petReducer(awakeState(), { type: "pet", now: 0 });
    expect(petReducer(state, { type: "settle", now: 60000 })).toMatchObject({
      pats: 1,
      lastPatAt: 0,
      happyUntil: null,
    });
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

  it("휴식 중에 만나면 자지 않고 바로 깨어 있음", () => {
    const awake = petReducer(createPetState(), {
      type: "start",
      now: 10000,
      awake: true,
    });
    expect(awake).toMatchObject({
      phase: "awake",
      introUntil: null,
      awakeAt: 10000,
    });
    expect(petPose(awake)).toBe("idle");
    // 이미 깬 뒤에는 다시 시작해도 그대로
    expect(petReducer(awake, { type: "start", now: 11000 })).toBe(awake);
    // 바로 쓰담으로 셈
    expect(petReducer(awake, { type: "pet", now: 10100 }).pats).toBe(1);
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

  it("다시 만나면 수면부터 시작하며 장면 준비 전 깨우기 예약은 무시", () => {
    const fresh = createPetState();
    expect(petReducer(fresh, { type: "advanceIntro", now: 100 })).toBe(fresh);
    const sleeping = petReducer(fresh, { type: "start", now: 200 });
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
});

describe("방 꾸미기 반응", () => {
  it("깨어 있으면 쓰담 횟수 없이 기뻐하고, 자는 중이거나 반응 중이면 무시", () => {
    const awake = awakeState();
    const cheered = petReducer(awake, { type: "cheer", now: 10 });
    expect(petPose(cheered)).toBe("happy");
    expect(cheered.pats).toBe(0);
    expect(petReducer(cheered, { type: "cheer", now: 20 })).toBe(cheered);
    const sleeping = createPetState();
    expect(petReducer(sleeping, { type: "cheer", now: 10 })).toBe(sleeping);
  });
});

describe("말풍선을 위한 시각", () => {
  it("깨어난 시각과 산책에서 돌아온 시각을 남김", () => {
    const awake = awakeState();
    expect(awake.awakeAt).toBe(0);
    const walking = petReducer(awake, { type: "walk", now: 10 });
    const home = petReducer(walking, { type: "returnHome", now: 9000 });
    expect(home).toMatchObject({ location: "home", homeAt: 9000 });
  });
});
