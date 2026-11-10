export const PET_COOLDOWN_MS = 350;
export const PET_HAPPY_MS = 2800;
export const PET_STROKE_DISTANCE = 16;

export type PetState = {
  pats: number;
  lastPatAt: number | null;
  happyUntil: number | null;
};

export type PetAction =
  | { type: "pet"; now: number }
  | { type: "settle"; now: number }
  | { type: "reset" };

export function createPetState(): PetState {
  return { pats: 0, lastPatAt: null, happyUntil: null };
}

/** 현재 시각을 주입해, UI·브라우저 타이머와 분리한 돌봄 규칙. */
export function petReducer(state: PetState, action: PetAction): PetState {
  switch (action.type) {
    case "pet":
      if (
        state.lastPatAt !== null &&
        action.now - state.lastPatAt < PET_COOLDOWN_MS
      )
        return state;
      return {
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
