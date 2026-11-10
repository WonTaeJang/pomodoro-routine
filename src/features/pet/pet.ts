export const PET_COOLDOWN_MS = 350;
export const PET_HAPPY_MS = 2800;
export const PET_STROKE_DISTANCE = 16;
export const PET_SLEEP_MS = 5000;
export const PET_STARTLE_MS = 1000;

export type PetState = {
  phase: "sleeping" | "startled" | "awake";
  introUntil: number | null;
  pats: number;
  lastPatAt: number | null;
  happyUntil: number | null;
};

export type PetAction =
  | { type: "start" | "advanceIntro" | "pet"; now: number }
  | { type: "settle"; now: number }
  | { type: "reset" };

export function createPetState(): PetState {
  return {
    phase: "sleeping",
    introUntil: null,
    pats: 0,
    lastPatAt: null,
    happyUntil: null,
  };
}

/** 현재 시각을 주입해, UI·브라우저 타이머와 분리한 돌봄 규칙. */
export function petReducer(state: PetState, action: PetAction): PetState {
  switch (action.type) {
    case "start":
      if (state.phase !== "sleeping" || state.introUntil !== null) return state;
      return { ...state, introUntil: action.now + PET_SLEEP_MS };
    case "advanceIntro":
      if (state.introUntil === null || action.now < state.introUntil)
        return state;
      return { ...state, phase: "awake", introUntil: null };
    case "pet":
      if (state.phase === "sleeping") {
        // Loading has no deadline yet, so cannot consume the first interaction.
        if (state.introUntil === null) return state;
        return {
          ...state,
          phase: "startled",
          introUntil: action.now + PET_STARTLE_MS,
        };
      }
      if (state.phase === "startled") return state;
      if (
        state.lastPatAt !== null &&
        action.now - state.lastPatAt < PET_COOLDOWN_MS
      )
        return state;
      return {
        ...state,
        pats: state.pats + 1,
        lastPatAt: action.now,
        happyUntil: action.now + PET_HAPPY_MS,
      };
    case "settle":
      if (state.happyUntil === null || action.now < state.happyUntil)
        return state;
      return { ...state, happyUntil: null };
    case "reset":
      return createPetState();
  }
}
