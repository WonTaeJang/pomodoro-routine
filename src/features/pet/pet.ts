export const PET_HAPPY_MS = 2800;
export const PET_SNACK_MS = 1800;
export const PET_STROKE_DISTANCE = 16;
export const PET_SLEEP_MS = 5000;
export const PET_STARTLE_MS = 1000;

export type PetState = {
  location: "home" | "walk";
  phase: "sleeping" | "startled" | "awake";
  introUntil: number | null;
  pats: number;
  snacks: number;
  lastPatAt: number | null;
  happyUntil: number | null;
  snackUntil: number | null;
};

export type PetAction =
  | { type: "start" | "advanceIntro" | "pet" | "feed" | "walk"; now: number }
  | { type: "settle"; now: number }
  | { type: "reset" | "returnHome" };

export function createPetState(): PetState {
  return {
    location: "home",
    phase: "sleeping",
    introUntil: null,
    pats: 0,
    snacks: 0,
    lastPatAt: null,
    happyUntil: null,
    snackUntil: null,
  };
}

export type PetPose = "sleeping" | "startled" | "snacking" | "happy" | "idle";

/** One derived pose for both the UI and Rive; do not persist duplicate flags. */
export function petPose(state: PetState): PetPose {
  if (state.phase !== "awake") return state.phase;
  if (state.snackUntil !== null) return "snacking";
  return state.happyUntil !== null ? "happy" : "idle";
}

export function nextReactionAt(state: PetState): number | null {
  return state.snackUntil ?? state.happyUntil;
}

function settleReactions(state: PetState, now: number): PetState {
  const snackUntil =
    state.snackUntil !== null && now < state.snackUntil
      ? state.snackUntil
      : null;
  const happyUntil =
    state.happyUntil !== null && now < state.happyUntil
      ? state.happyUntil
      : null;
  return snackUntil === state.snackUntil && happyUntil === state.happyUntil
    ? state
    : { ...state, snackUntil, happyUntil };
}

/** 현재 시각을 주입해, UI·브라우저 타이머와 분리한 돌봄 규칙. */
export function petReducer(state: PetState, action: PetAction): PetState {
  if (state.location === "walk") {
    return action.type === "returnHome"
      ? { ...state, location: "home" }
      : state;
  }
  if (
    action.type === "pet" ||
    action.type === "feed" ||
    action.type === "walk" ||
    action.type === "settle"
  ) {
    state = settleReactions(state, action.now);
  }
  switch (action.type) {
    case "walk":
      if (state.phase !== "awake" || nextReactionAt(state) !== null)
        return state;
      return { ...state, location: "walk" };
    case "returnHome":
      return state;
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
      if (nextReactionAt(state) !== null) return state;
      return {
        ...state,
        pats: state.pats + 1,
        lastPatAt: action.now,
        happyUntil: action.now + PET_HAPPY_MS,
      };
    case "feed":
      if (state.phase !== "awake" || nextReactionAt(state) !== null)
        return state;
      return {
        ...state,
        snacks: state.snacks + 1,
        snackUntil: action.now + PET_SNACK_MS,
        happyUntil: action.now + PET_SNACK_MS,
      };
    case "settle":
      return state;
    case "reset":
      return createPetState();
  }
}
